const { ApolloServer } = require('@apollo/server');
const { RESTDataSource } = require('@apollo/datasource-rest');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { expressMiddleware } = require('@apollo/server/express4');
const { TYPE_DEFS } = require('./type');
const cors = require("cors")
const { json } = require("body-parser")
const express = require("express")
const http = require("http");
const app = express();
const httpServer = http.createServer(app);

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
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

async function init() {
    await server.start()
    app.use(
        "/graphql",
        cors(),
        json(),
        expressMiddleware(server, {
            context: () => {
                return {
                    dataSources: {
                        statsAPI: new StatsAPI()
                    }
                }
            }
        })
    )
    httpServer.listen({ port: PORT })
    return PORT
}
init().then(url => {
    console.log(`🚀  Server ready on port: ${url}`);
})