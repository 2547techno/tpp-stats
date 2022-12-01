const { ChatClient } = require("@kararty/dank-twitch-irc");
const { Queue } = require("./lib/queue")
const mariadb = require("mariadb");

if (process.env.DOTENV) {
    require("dotenv").config();
}

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    connectionLimit: 1
});
const client = new ChatClient();
// const updateQueue = new Queue();
const STAT_KEYWORDS = ["left","right","up","down","a","b","start","select","anarchy","democracy"];

// updateQueue.on("push", val => {
//     console.log(`push: ${JSON.stringify(val)} | size: ${updateQueue.size()}`);
// })

client.on("ready", () => {
    console.log("[IRC] Ready");
    client.join("ipfx");
    client.join("mizkif");
});
client.on("close", err => console.log(`[IRC] Closed: ${err}`))

client.on("JOIN", ({channelName}) => console.log(`[IRC] Joined: ${channelName}`))

client.on("PRIVMSG", (msg) => {
    // console.log(`[#${msg.channelName}] ${msg.displayName}: ${msg.messageText}`);
    if (msg.channelID == process.env.TARGET_CHANNEL) {
        updateStat(msg)
    }
});

function updateStat({senderUserID, displayName, messageText}) {
    if (STAT_KEYWORDS.includes(messageText.trim().toLowerCase())) {
        // updateQueue.push({
        //     uid: senderUserID,
        //     username: displayName,
        //     message: messageText.trim().toLowerCase()
        // })

        updateDb({
            uid: parseInt(senderUserID),
            username: displayName,
            stat: messageText.trim().toLowerCase()
        })
    }
}

async function updateDb({uid, username, stat}) {
    let conn;
    try {
        conn = await pool.getConnection();
        conn.beginTransaction();
        const res = await conn.query(`
            UPDATE TPP_STATS.STATS
            SET COUNT_${stat.toUpperCase()} = COUNT_${stat.toUpperCase()}+1
            WHERE UID=${uid};
        `);

        if (res.affectedRows < 1) {
            await conn.query(`
                INSERT INTO TPP_STATS.STATS
                (UID, USERNAME, COUNT_${stat.toUpperCase()})
                VALUES(${uid}, '${username}', 1);
            `);
        }
        conn.commit();
    } catch(err) {
        console.error(err);
        conn.rollback();
    } finally {
        if (conn) conn.release();
    }
}

client.connect();