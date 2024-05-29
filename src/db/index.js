import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'
import { logger } from '../index.js';

const connectDB =  async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI1}/${DB_NAME}`);
        logger.info(`MongoDB connected !! DB Host : ${connectionInstance.connection.host}`);
    } catch (error) {
        logger.error("MongoDB Error :" + error);
        process.exit(1)
    }
}
export default connectDB;