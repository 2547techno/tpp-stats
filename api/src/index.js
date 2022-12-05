const mariadb = require("mariadb");
const app = require("express")();
const cors = require("cors");
const SqlString = require('sqlstring');
const { parseUserData, parseTotalData } = require("./helper")
let totalStats = {};
let topStats = [];
let statsInterval = null;

if (process.env.DOTENV) {
    require("dotenv").config();
}

if (!process.env.DB_HOST) console.log("[config] DB_HOST MISSING")
if (!process.env.DB_USER) console.log("[config] DB_USER MISSING")
if (!process.env.DB_PASS) console.log("[config] DB_PASS MISSING")
if (!process.env.DB_DATABASE) console.log("[config] DB_DATABASE MISSING")
if (!process.env.PORT) {
    console.log("[config] PORT MISSING")
    process.exit(1);
}

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    connectionLimit: 10
});

app.use(cors())

app.get("/", (req, res) => {
    res.json({
        messages: ["TPP stats api, made by 2547techno", "Why are you even here, go away >:("]
    })
})

app.get("/totalStats", (req, res) => {
    res.json({
        a: parseInt(totalStats.COUNT_A),
        b: parseInt(totalStats.COUNT_B),
        left: parseInt(totalStats.COUNT_LEFT),
        right: parseInt(totalStats.COUNT_RIGHT),
        up: parseInt(totalStats.COUNT_UP),
        down: parseInt(totalStats.COUNT_DOWN),
        start: parseInt(totalStats.COUNT_START),
        select: parseInt(totalStats.COUNT_SELECT),
        l: parseInt(totalStats.COUNT_L),
        r: parseInt(totalStats.COUNT_R),
        anarchy: parseInt(totalStats.COUNT_ANARCHY),
        democracy: parseInt(totalStats.COUNT_DEMOCRACY),
        total: parseInt(totalStats.TOTAL)
        // other: parseInt(totalStats.COUNT_OTHER)
    })
})

app.get("/topStats", (req, res) => {
    let users = [];

    for (let user of topStats) {
        users.push(parseUserData(user))
    }

    res.json({
        users,
        totalStats: parseTotalData(totalStats)
    })
})

app.get("/stats/:username", async (req, res) => {
    const data = await getUserStats(req.params.username);

    if (data.length < 1) {
        return res.status(404).json({
            error: true,
            status: 404,
            message: `No stats found for ${req.params.username}!`
        })
    }

    const userData = data[0];
    res.json({
        ...parseUserData(userData),
        totalCount: parseTotalData(totalStats)
    })
})

async function getUserStats(username) {
    let conn;
    let res;
    try {
        conn = await pool.getConnection();
        conn.beginTransaction();
        res = await conn.query(SqlString.format(`
            SELECT * FROM TPP_STATS.STATS
            WHERE USERNAME = ?
        `, username));

        conn.commit();
    } catch(err) {
        console.error(err);
        conn.rollback();
    } finally {
        if (conn) conn.release();
    }
    return res;
}

async function getTotalStats() {
    let conn;
    let res;
    try {
        conn = await pool.getConnection();
        conn.beginTransaction()
        res = (await conn.query(`SELECT * FROM TPP_STATS.TOTAL_STATS ts;`))[0];
        conn.commit();
    } catch(err) {
        console.error(err);
        conn.rollback();
    } finally {
        if (conn) conn.release();
    }
    return res;
}

async function getTopStats() {
    let conn;
    let res;
    try {
        conn = await pool.getConnection();
        conn.beginTransaction()
        res = await conn.query(`SELECT * FROM TPP_STATS.TOP_STATS ts;`);
        conn.commit();
    } catch(err) {
        console.error(err);
        conn.rollback();
    } finally {
        if (conn) conn.release();
    }
    return res;
}

app.listen(parseInt(process.env.PORT), () => {
    console.log("[server] listening on: " + process.env.PORT);

    getTotalStats().then(data => totalStats = data);
    getTopStats().then(data => topStats = data);
    statsInterval = setInterval(() => {
        getTotalStats().then(data => totalStats = data);
        getTopStats().then(data => topStats = data);
    }, 60 * 1000) // 1m interval
})