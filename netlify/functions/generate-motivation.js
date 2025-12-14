const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("./_firebase");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handler = async (event, context) => {
    const apiMethod = event.httpMethod;
    if (apiMethod !== 'POST') {
        // “Method not allowed” (standard API error)
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
    // 📁 users
    // └── uid
    // └── motivation
    // └── dateKey
    const ref = db.doc(`users/${uid}/motivation/${dateKey}`);
    const snap = await ref.get();

    if (snap.exists) {
        return {
            statusCode: 200,
            body: JSON.stringify(snap.data())
        };
    }

    // Read Inputs 
    const perfSnap = await db.doc(`users/${uid}/performance/${dateKey}`).get();
    const streakSnap = await db.doc(`users/${uid}/streak/info`).get();

    const ratio = perfSnap?.exists ? perfSnap.data().ratio ?? 0 : 0;
    const streak = streakSnap?.exists ? streakSnap?.data().current ?? 0 : 0;

    // Gemini prompt (short + controlled)
    const prompt = `
User completed ${ratio}% of today's actions.
Current streak: ${streak} days.

Write ONE short, encourging sentence.
No emojis. No quote. Max 15 words.
`;

    console.log('prompt', prompt);
    // Generate Motivation by Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    console.log('text', text);

    const payload = {
        text,
        date: dateKey,
        // Save server time (not fake client time)
        generatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await ref.set(payload);

    return {
        statusCode: 200,
        body: JSON.stringify(payload)
    };
}