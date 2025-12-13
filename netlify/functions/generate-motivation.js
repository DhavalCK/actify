const admin = require("./_firebase");

exports.handler = async (event, context) => {
    const apiMethod = event.httpMethod;
    if (apiMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({
                error: true,
                message: 'API is not found !!!',
            })
        }
    }

    const body = event?.body ? JSON.parse(event.body || '{}') : null;
    const { uid, dateKey } = body;

    if (!uid || !dateKey) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "uid and dateKey required" })
        };
    }

    const db = admin.firestore();
    const ref = db.doc(`users/${uid}/motivation/${dateKey}`);
    const snap = await ref.get();

    if (snap.exists) {
        return {
            statusCode: 200,
            body: JSON.stringify(snap.data())
        };
    }

    // Set static Motivation
    const text = "Nice work. Showing up today matters more than perfection.";

    const payload = {
        text,
        date: dateKey,
        generatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await ref.set(payload);

    return {
        statusCode: 200,
        body: JSON.stringify(payload)
    };
}