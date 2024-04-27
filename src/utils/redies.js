import { createClient } from "redis";

export const rediesClient = createClient({
    // password: "nprrGF8u4lgWFaPMCZzuhZSFHupLkaxx",
    // socket: {
    //     host: 'redis-14127.c278.us-east-1-4.ec2.redns.redis-cloud.com',
    //     port: 14127
    // },
    host: '127.0.0.1',
    port: 6379, 
});

rediesClient.on("error", (err) => console.log("Redis Client Error", err));

export async function getRedisClient() {
    await rediesClient.connect().then(() => console.log("Redis Client Connected"));
}
