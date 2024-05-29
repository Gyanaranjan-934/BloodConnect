import { createClient } from "redis";
import { logger } from "../index.js";

export const rediesClient = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
    // host: '127.0.0.1',
    // port: 6379, 
});

rediesClient.on("error", (err) => {
    logger.error("Redis Client Error", err)
});

export async function getRedisClient() {
    await rediesClient.connect().then(() => logger.info("Redis Client Connected"));
}
