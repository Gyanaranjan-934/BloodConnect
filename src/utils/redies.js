import { createClient } from "redis";
import { logger } from "../index.js";

export const rediesClient = createClient({
    // password: "nprrGF8u4lgWFaPMCZzuhZSFHupLkaxx",
    // socket: {
    //     host: 'redis-14127.c278.us-east-1-4.ec2.redns.redis-cloud.com',
    //     port: 14127
    // },
    host: '127.0.0.1',
    port: 6379, 
});

rediesClient.on("error", (err) => logger.error("Redis Client Error", err));

export async function getRedisClient() {
    await rediesClient.connect().then(() => logger.info("Redis Client Connected"));
}
