const mariadb = require("mariadb");
const app = require("express")();
const cors = require("cors");
const SqlString = require('sqlstring');
let totalStats = {};
let totalStatsInterval = null;

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
        total: parseInt(totalStats.TOTAL),
        other: parseInt(totalStats.COUNT_OTHER)
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
        uid: userData.UID,
        displayName: userData.DISPLAYNAME,
        username: userData.USERNAME,
        count: {
            a: parseInt(userData.COUNT_A),
            b: parseInt(userData.COUNT_B),
            left: parseInt(userData.COUNT_LEFT),
            right: parseInt(userData.COUNT_RIGHT),
            up: parseInt(userData.COUNT_UP),
            down: parseInt(userData.COUNT_DOWN),
            start: parseInt(userData.COUNT_START),
            select: parseInt(userData.COUNT_SELECT),
            l: parseInt(userData.COUNT_L),
            r: parseInt(userData.COUNT_R),
            anarchy: parseInt(userData.COUNT_ANARCHY),
            democracy: parseInt(userData.COUNT_DEMOCRACY),
            total: parseInt(userData.TOTAL),
            other: parseInt(userData.COUNT_OTHER)
        },
        totalCount: {
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
            total: parseInt(totalStats.TOTAL),
            other: parseInt(totalStats.COUNT_OTHER)
        }
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

app.listen(parseInt(process.env.PORT), () => {
    console.log("[server] listening on: " + process.env.PORT);
    getTotalStats().then(data => totalStats = data);
    totalStatsInterval = setInterval(() => {
        getTotalStats().then(data => totalStats = data);
    }, 60 * 1000) // 1s interval
})