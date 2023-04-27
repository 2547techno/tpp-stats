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

if (!process.env.API1_URL) {
    console.log("[config] API1_URL MISSING")
    process.exit(1);
}
if (!process.env.API2_URL) {
    console.log("[config] API2_URL MISSING")
    process.exit(1);
}
if (!process.env.PORT) console.log("[config] PORT MISSING, USING DEFAULT PORT");

class StatsAPI extends RESTDataSource {
    baseUrl1 = new URL(process.env.API1_URL)
    baseUrl2 = new URL(process.env.API2_URL)

    versions = {
        "MIZKIF_2022": this.baseUrl1,
        "OTK_2023": this.baseUrl2
    }

    async getTotalStats(version) {
        return this.get(new URL("/totalStats", this.versions[version]))
    }

    async getTopStats(version) {
        return this.get(new URL("/topStats", this.versions[version]))
            .then(res => res.users)
    }

    async getUserStats(login, version) {
        try {
            const res = await this.get(new URL(`/stats/${login}`, this.versions[version]))
            return res
        } catch (err) {
            return null;
        }
    }

}

const resolvers = {
    Query: {
        user: async (parent, args, { dataSources }, info) => {
            return dataSources.statsAPI.getUserStats(args.login, args.version)
        },
        totalStats: async (parent, args, { dataSources }, info) => {
            return dataSources.statsAPI.getTotalStats(args.version)
        },
        topStats: async (parent, args, { dataSources }, info) => {
            return dataSources.statsAPI.getTopStats(args.version)
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