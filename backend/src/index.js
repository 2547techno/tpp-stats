const { ChatClient } = require("@kararty/dank-twitch-irc");
const { Queue } = require("./lib/queue")
const client = new ChatClient();
const updateQueue = new Queue();
const STAT_KEYWORDS = ["left","right","up","down","a","b","start","select","anarchy","democracy"];

console.log(process.env.TARGET_CHANNEL);

updateQueue.on("push", val => {
    console.log(`push: ${JSON.stringify(val)}`);
    console.log(`size: ${updateQueue.size()}`);
})

client.on("ready", () => {
    console.log("[IRC] Ready");
    client.join("ipfx");
    client.join("mizkif");
});
client.on("close", err => console.log(`[IRC] Closed: ${err}`))

client.on("JOIN", ({channelName}) => console.log(`[IRC] Joined: ${channelName}`))

client.on("PRIVMSG", (msg) => {
    console.log(`[#${msg.channelName}] ${msg.displayName}: ${msg.messageText}`);
    if (msg.channelID == process.env.TARGET_CHANNEL) {
        updateStat(msg)
    }
});

function updateStat({senderUserID, displayName, messageText}) {
    if (STAT_KEYWORDS.includes(messageText.trim().toLowerCase())) {
        updateQueue.push({
            uid: senderUserID,
            username: displayName,
            message: messageText.trim().toLowerCase()
        })
    }
}

client.connect();