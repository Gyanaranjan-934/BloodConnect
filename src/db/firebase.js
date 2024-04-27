// firebase.js
import firebaseAdmin from "firebase-admin";
import serviceAccountKey from "../serviceAccountKey.json" assert { type: "json" };

export const initializeFirebase = () => {
    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccountKey),
    });
};

export const firebase = firebaseAdmin;

export const sendNotification = async (deviceToken, notification) => {
    const firebaseMessaging = firebase.messaging();
    firebaseMessaging
        .send({
            notification:notification,
            token: deviceToken,
        })
        .then((response) => {
            console.log("Message sent successfully:", response);
        })
        .catch((error) => {
            console.error("Error sending message:", error);
        });
};


// sendNotification(deviceToken, {
//     title: "Your message title",
//     body: "Your message content",
// });