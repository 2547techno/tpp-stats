const { ChatClient } = require("@kararty/dank-twitch-irc");
const mariadb = require("mariadb");

if (process.env.DOTENV) {
    require("dotenv").config();
}

console.log("[CONFIG] TARGET_CHANNEL: " + process.env.TARGET_CHANNEL);
console.log("[CONFIG] TMI_LOGIN: " + process.env.TMI_LOGIN);
if (process.env.TMI_LOGIN && !process.env.TMI_OAUTH) {
    console.log("[CONFIG] TMI_OAUTH MISSING");
}

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    connectionLimit: 1
});

let clientOpts = {};
if(process.env.TMI_LOGIN && process.env.TMI_OAUTH) {
    clientOpts = {
        username: process.env.TMI_LOGIN,
        password: process.env.TMI_OAUTH
    }
}

const client = new ChatClient(clientOpts);
const STAT_KEYWORDS = ["left","right","up","down","a","b","start","select","anarchy","democracy"];

client.on("ready", () => {
    console.log("[IRC] Ready");
    client.join("ipfx");
    client.join("2547techno");
    client.join("markzynk");
    client.join("mizkif");
});
client.on("close", err => console.log(`[IRC] Closed: ${err}`))

client.on("JOIN", ({channelName}) => console.log(`[IRC] Joined: ${channelName}`))

client.on("PRIVMSG", (msg) => {
    // console.log(`[#${msg.channelName}] ${msg.displayName}: ${msg.messageText}`);
    if (msg.channelID == process.env.TARGET_CHANNEL) {
        updateStat(msg)
    }
    processCommand(msg);
});

function updateStat({senderUserID, displayName, messageText}) {
    if (STAT_KEYWORDS.includes(messageText.trim().toLowerCase())) {

        updateDb({
            uid: parseInt(senderUserID),
            username: displayName,
            stat: messageText.trim().toLowerCase()
        })
    }
}

function processCommand({senderUserID, messageText}) {
    if (senderUserID != process.env.ADMIN_USER) return;
    if (!messageText.startsWith("~")) return;

    messageText = messageText.substr(1);
    let args = messageText.split(" ")
    const command = args.shift();
    if (!command) return;

    console.log(`[COMMAND] ${command} | ${JSON.stringify(args)}`);
    // TODO: command logic (idek if i need any commands, just here if i need it)
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