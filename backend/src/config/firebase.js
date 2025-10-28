// config/firebase.js
const admin = require(firebase-admin);
const {firebaseKeyPath} = require("./index");

let firebaseApp;

if (firebaseKeyPath) {
    const serviceAccount = require(firebaseKeyPath);
    firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

module.exports = firebaseApp ? admin : null;