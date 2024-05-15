import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { initializeFirebase } from "./db/firebase.js";
import { getRedisClient } from "./utils/redies.js";
import winston from "winston";

dotenv.config({
    path: "./env",
});

export const logger = winston.createLogger({
    level: "info",
    format: winston.format.cli(),
    transports: [new winston.transports.Console()],
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            logger.info(`Server is listening at ${process.env.PORT}`);
        });
        initializeFirebase();
        getRedisClient();
    })
    .catch((err) => {
        logger.error(err);
    });
