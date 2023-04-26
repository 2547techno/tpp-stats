const { ApolloServer } = require('@apollo/server');
const { RESTDataSource } = require('@apollo/datasource-rest');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { TYPE_DEFS } = require('./type');

if (process.env.DOTENV) {
    require("dotenv").config();
}
const PORT = process.env.PORT ?? 3000;

if (!process.env.API_URL) {
    console.log("[config] API_URL MISSING")
    process.exit(1);
}
if (!process.env.PORT) console.log("[config] PORT MISSING, USING DEFAULT PORT");

class StatsAPI extends RESTDataSource {
    baseUrl = new URL(process.env.API_URL)

    async getTotalStatus() {
        return this.get(new URL("/totalStats", this.baseUrl))
    }

    async getTopStatus() {
        return this.get(new URL("/topStats", this.baseUrl))
            .then(res => res.users)
    }

}

const resolvers = {
    Query: {
        totalStats: async (parent, args, { dataSources }, info) => {
            return dataSources.statsAPI.getTotalStatus()
        },
        topStats: async (parent, args, { dataSources }, info) => {
            return dataSources.statsAPI.getTopStatus()
        }
    }
};

const server = new ApolloServer({
    typeDefs: TYPE_DEFS,
    resolvers,
});

async function init() {
    const { url } = await startStandaloneServer(server, {
        listen: { port: PORT },
        context: () => {
            return {
                dataSources: {
                    statsAPI: new StatsAPI()
                }
            }
        }
    });
    return url
}
init().then(url => {
    console.log(`🚀  Server ready at: ${url}`);
})