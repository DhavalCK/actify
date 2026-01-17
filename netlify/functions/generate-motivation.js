const admin = require("./_firebase");
const messages = require("./motivation-messages.json");

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

    // Read JSON data sent from frontend
    const body = event?.body ? JSON.parse(event.body || '{}') : null;
    const { uid, dateKey } = body;

    if (!uid || !dateKey) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "uid and dateKey required" })
        };
    }

    // Get Firestore admin access
    const db = admin.firestore();
    const ref = db.doc(`users/${uid}/motivation/${dateKey}`);

    // 1. Check if motivation already exists for this date (unless forced)
    const { force } = body;
    const snap = await ref.get();

    if (!force && snap.exists) {
        return {
            statusCode: 200,
            body: JSON.stringify(snap.data())
        };
    }

    // 2. Read Inputs for new generation
    const perfSnap = await db.doc(`users/${uid}/performance/${dateKey}`).get();
    const streakSnap = await db.doc(`users/${uid}/streak/info`).get();

    const ratio = perfSnap?.exists ? (perfSnap.data().ratio ?? 0) : 0;
    const streak = streakSnap?.exists ? (streakSnap.data().current ?? 0) : 0;

    // 3. Select Bucket based on Rules
    let bucketKey = 'low_ratio_low_streak'; // default fallback

    if (ratio === 100) {
        bucketKey = 'perfect_day';
    } else if (ratio >= 70) {
        bucketKey = 'high_ratio';
    } else if (ratio >= 30) {
        // Medium Ratio (30-69)
        if (streak >= 3) {
            bucketKey = 'medium_ratio_high_streak';
        } else {
            bucketKey = 'medium_ratio_low_streak';
        }
    } else {
        // Low Ratio (< 30)
        if (streak >= 3) {
            bucketKey = 'low_ratio_high_streak';
        } else {
            bucketKey = 'low_ratio_low_streak';
        }
    }

    // 4. Select Random Message from Bucket
    const bucketMessages = messages[bucketKey] || messages['low_ratio_low_streak'];
    const randomIndex = Math.floor(Math.random() * bucketMessages.length);
    const text = bucketMessages[randomIndex];

    const payload = {
        text,
        date: dateKey,
        generatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // 5. Save to Firestore
    await ref.set(payload);

    return {
        statusCode: 200,
        body: JSON.stringify(payload)
    };
}