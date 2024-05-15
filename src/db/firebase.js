// firebase.js
import firebaseAdmin from "firebase-admin";
import serviceAccountKey from "../serviceAccountKey.json" assert { type: "json" };
import { logger } from "../index.js";

export const initializeFirebase = () => {
    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert({
            projectId: process.env.FIREBASE_SERVICE_ACC_KEY_PROJECT_ID,
            clientEmail: process.env.FIREBASE_SERVICE_ACC_KEY_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_SERVICE_ACC_KEY_PRIVATE_KEY,
        }),
    });
};

export const firebase = firebaseAdmin;

export const sendNotification = async (deviceToken, notification) => {
    const firebaseMessaging = firebase.messaging();
    firebaseMessaging
        .send({
            notification: notification,
            token: deviceToken,
        })
        .then((response) => {
            logger.info(`Message sent successfully: ${response}`);
        })
        .catch((error) => {
            logger.error(`Error sending message: ${error}`);
        });
};

// sendNotification(deviceToken, {
//     title: "Your message title",
//     body: "Your message content",
// });
