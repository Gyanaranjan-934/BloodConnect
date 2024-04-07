// firebase.js
import firebaseAdmin from "firebase-admin";
import serviceAccountKey from "../serviceAccountKey.json" assert { type: "json" };

export const initializeFirebase = () =>{
    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccountKey)
    });    
}

export const firebase = firebaseAdmin;
