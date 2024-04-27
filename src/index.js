import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { initializeFirebase } from "./db/firebase.js";
import { getRedisClient } from "./utils/redies.js";

dotenv.config({
    path: "./env",
});

connectDB()
    .then(() => {
        const server = app.listen(process.env.PORT || 5000, () => {
            console.log(`server is listening at ${process.env.PORT}`);
        });
        initializeFirebase();
        getRedisClient();
        // Initialize Firebase
        // const io = new Server(server, {
        //     pingTimeout: 60000,
        //     cors: {
        //         origin: '*', //TODO: should change the origin at deployment time
        //         methods: ['GET', 'POST']
        //     }
        // });
        // io.on('connection', (socket) => {
        //     console.log('A user connected');
        //     // Handle chat messages
        //     socket.on('chat message', (message) => {
        //         console.log("Connected to the chat");
        //         // Broadcast the message to all connected clients
        //         io.emit('chat message', message);
        //     });
        //     socket.on("typing", () => {
        //         socket.emit("typing");
        //     });

        //     socket.on("stop typing", (room) => {
        //         socket.emit("stop typing");
        //     });
        //     // Handle disconnections
        //     socket.on('disconnect', () => {
        //         console.log('User disconnected');
        //     });
        // });
    })
    .catch((err) => {
        console.error(err);
    });
