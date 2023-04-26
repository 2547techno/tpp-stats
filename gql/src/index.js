const { ApolloServer } = require('@apollo/server');
const { RESTDataSource } = require('@apollo/datasource-rest');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { TYPE_DEFS } = require('./type');
const { GraphQLError } = require('graphql');

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

    async getTotalStats() {
        return this.get(new URL("/totalStats", this.baseUrl))
    }

    async getTopStats() {
        return this.get(new URL("/topStats", this.baseUrl))
            .then(res => res.users)
    }

    async getUserStats(login) {
        try {
            const res = await this.get(new URL(`/stats/${login}`, this.baseUrl))
            return res
        } catch (err) {
            return null;
        }
    }

}

const resolvers = {
    Query: {
        user: async (parent, args, { dataSources }, info) => {
            return dataSources.statsAPI.getUserStats(args.login)
        },
        totalStats: async (parent, args, { dataSources }, info) => {
            return dataSources.statsAPI.getTotalStats()
        },
        topStats: async (parent, args, { dataSources }, info) => {
            return dataSources.statsAPI.getTopStats()
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