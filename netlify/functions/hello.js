const admin = require("./_firebase");

exports.handler = async () => {
    const db = admin.firestore();
    const snap = await db.collection("_health").limit(1).get();
    return {
        statusCode: 200,
        body: JSON.stringify({
            ok: true,
            firestoreReachable: !snap.empty
        })
    };
};