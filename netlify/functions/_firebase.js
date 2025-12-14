// _firebase.js safely connects Netlify → Firebase with admin access.

//  Import Firebase Admin SDK - full access, no rules
const admin = require('firebase-admin');

if (!admin.apps.length) {
    // Start Firebase connection
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") // Because Netlify stores multiline keys in one line
        })
    })
}

module.exports = admin;