export const USER_STATS = `#graphql
fragment Stats_Frag on Stats {
    a
    b
    left
    right
    up
    down
    start
    select
    l
    r
    anarchy
    democracy
    total
}

query Query($version: Version, $login: String) {
    user(login: $login, version: $version) {
        uid
        displayName
        username
        count {
            ...Stats_Frag
        }
    }
    totalStats(version: $version) {
        ...Stats_Frag
    }
}
`