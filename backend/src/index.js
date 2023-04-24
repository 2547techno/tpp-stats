const { ChatClient, AlternateMessageModifier } = require("@kararty/dank-twitch-irc");
const mariadb = require("mariadb");

if (process.env.DOTENV) {
    require("dotenv").config();
}

let canReply = process.env.TMI_LOGIN && process.env.TMI_OAUTH; //only enable replying with bot if creds are present
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
    connectionLimit: 50
});

let clientOpts = {};
if(process.env.TMI_LOGIN && process.env.TMI_OAUTH) {
    clientOpts = {
        username: process.env.TMI_LOGIN,
        password: process.env.TMI_OAUTH
    }
}

let client = new ChatClient(clientOpts);
client.use(new AlternateMessageModifier(client));
const STAT_KEYWORDS = ["left","right","up","down","a","b","start","select","anarchy","democracy","l","r"];
const INVIS_CHAR = "󠀀";

client.on("ready", () => {
    console.log("[IRC] Ready");
    client.join("ipfx");
    client.join("techno_______");
    client.join("syn4ack");
    client.join("mizkif");
    client.join("otknetwork");
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

function updateStat({senderUserID, senderUsername, displayName, messageText}) {
    const message = messageText.replaceAll(INVIS_CHAR,"").trim().toLowerCase()
    updateDb({
        uid: parseInt(senderUserID),
        username: senderUsername,
        displayName,
        stat: STAT_KEYWORDS.includes(message) ? message : "other"
    })
}

function processCommand({channelName, senderUserID, messageText}) {
    if (senderUserID != process.env.ADMIN_USER) return;
    if (!messageText.startsWith("~")) return;

    messageText = messageText.substr(1);
    let args = messageText.split(" ")
    const command = args.shift();
    if (!command) return;

    console.log(`[COMMAND] ${command} | ${JSON.stringify(args)}`);
    // TODO: command logic (idek if i need any commands, just here if i need it)

    switch (command.toLowerCase()) {
        case "resetstats":
        case "clearstats":
            resetStats()
                .then(() => {
                    const message = "[DATABASE] Cleared STATS table"
                    console.log(message);
                    sendMessage(channelName, message)
                })
                .catch(err => {
                    sendMessage(channelName, "[DATABASE] Error clearing STATS table")
                })
            break;
    
        default:
            break;
    }
}

async function updateDb({uid, username, displayName, stat}) {
    let conn;
    try {
        conn = await pool.getConnection();
        conn.beginTransaction();
        const res = await conn.query(`
            UPDATE ${process.env.DB_DATABASE}.STATS
            SET COUNT_${stat.toUpperCase()} = COUNT_${stat.toUpperCase()}+1
            WHERE UID=${uid};
        `);

        if (res.affectedRows < 1) {
            await conn.query(`
                INSERT INTO ${process.env.DB_DATABASE}.STATS
                (UID, USERNAME, DISPLAYNAME, COUNT_${stat.toUpperCase()})
                VALUES(${uid}, '${username}', '${displayName}', 1);
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

async function resetStats() {
    let conn;
    try {
        conn = await pool.getConnection();
        conn.beginTransaction();
        await conn.query(`TRUNCATE TABLE ${process.env.DB_DATABASE}.STATS;`);
        conn.commit();
    } catch(err) {
        console.error(err);
        conn.rollback();
    } finally {
        if (conn) conn.release();
    }
}

function sendMessage(channel, message) {
    if (!canReply) return;
    client.say(channel, message)
}

client.connect();