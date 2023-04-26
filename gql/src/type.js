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

  type Query {
    user: User
    totalStats: Stats
    topStats: [User]
  }
`;

module.exports = {
    TYPE_DEFS
}