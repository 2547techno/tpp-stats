const TYPE_DEFS = `#graphql
  type User {
    uid: Int
    displayName: String
    username: String
    count: Stats
  }

  type Stats {
    a: Int
    b: Int
    left: Int
    right: Int
    up: Int
    down: Int
    start: Int
    select: Int
    l: Int
    r: Int
    anarchy: Int
    democracy: Int
    total: Int
  }

  enum Version {
    MIZKIF_2022
    OTK_2023
  }

  type Query {
    user(login: String, version: Version): User
    totalStats(version: Version): Stats
    topStats(version: Version): [User]
  }
`;

module.exports = {
    TYPE_DEFS
}