function parseUserData(data) {
    return {
        uid: data.UID,
        displayName: data.DISPLAYNAME,
        username: data.USERNAME,
        count: {
            a: parseInt(data.COUNT_A),
            b: parseInt(data.COUNT_B),
            left: parseInt(data.COUNT_LEFT),
            right: parseInt(data.COUNT_RIGHT),
            up: parseInt(data.COUNT_UP),
            down: parseInt(data.COUNT_DOWN),
            start: parseInt(data.COUNT_START),
            select: parseInt(data.COUNT_SELECT),
            l: parseInt(data.COUNT_L),
            r: parseInt(data.COUNT_R),
            anarchy: parseInt(data.COUNT_ANARCHY),
            democracy: parseInt(data.COUNT_DEMOCRACY),
            total: parseInt(data.TOTAL),
            other: parseInt(data.COUNT_OTHER)
        }
    }
}

function parseTotalData(data) {
    return {
        a: parseInt(data.COUNT_A),
        b: parseInt(data.COUNT_B),
        left: parseInt(data.COUNT_LEFT),
        right: parseInt(data.COUNT_RIGHT),
        up: parseInt(data.COUNT_UP),
        down: parseInt(data.COUNT_DOWN),
        start: parseInt(data.COUNT_START),
        select: parseInt(data.COUNT_SELECT),
        l: parseInt(data.COUNT_L),
        r: parseInt(data.COUNT_R),
        anarchy: parseInt(data.COUNT_ANARCHY),
        democracy: parseInt(data.COUNT_DEMOCRACY),
        total: parseInt(data.TOTAL),
        other: parseInt(data.COUNT_OTHER)
    }
}

exports.parseUserData = parseUserData;
exports.parseTotalData = parseTotalData;