import express from "express";
import cors from 'cors'
import cookieParser from 'cookie-parser'
// // routes import
import userRouter from './routes/user.routes.js'
import alertRouter from './routes/alert.routes.js'
import doctorRouter from './routes/doctor.routes.js'
import eventRouter from './routes/event.routes.js'

const app = express();


// used to set the security frontend url for incoming requests
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
// set how much size of cookie can be requested to server
app.use(express.json({ limit: "16kb" }));
// to encode the urls and limit the query size after request
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"))
app.use(cookieParser());



// // routes declarations
app.use('/api/v1/auth',userRouter)
app.use('/api/v1/alert',alertRouter)
app.use('/api/v1/doctor',doctorRouter)
app.use('/api/v1/event',eventRouter)
export { app }