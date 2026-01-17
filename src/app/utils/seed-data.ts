import { Firestore, collection, doc, writeBatch, Timestamp } from '@angular/fire/firestore';

/**
 * DEMO DATA SEED
 * 
 * Populates Firestore with realistic demo data.
 * 
 * STRUCTURE:
 * - users/{uid}/actions
 * - users/{uid}/performance/{date}
 * - users/{uid}/streak/info
 * - users/{uid}/motivation/{date}
 */
export async function seedDemoData(db: Firestore, uid: string) {
    console.log('🌱 STARTING DEMO DATA SEED...');
    const batch = writeBatch(db);

    const now = new Date();
    const todayKey = getTodayKeyUTC(now);
    const yesterdayKey = getYesterdayKeyUTC(now);

    // --- 1. TODAY ACTIONS ---
    // 1 Completed (30-60 mins ago)
    const doneActionId = doc(collection(db, 'users', uid, 'actions')).id;
    const doneTime = new Date(now.getTime() - 45 * 60000); // 45 mins ago
    const createTimeDone = new Date(doneTime.getTime() - 2 * 60 * 60000); // Created 2 hours before done

    batch.set(doc(db, 'users', uid, 'actions', doneActionId), {
        title: 'Plan the day',
        done: true,
        createdAt: Timestamp.fromDate(createTimeDone),
        doneAt: Timestamp.fromDate(doneTime)
    });

    // 2 Incomplete (Created today)
    const todo1Id = doc(collection(db, 'users', uid, 'actions')).id;
    batch.set(doc(db, 'users', uid, 'actions', todo1Id), {
        title: 'Read 10 minutes',
        done: false,
        createdAt: Timestamp.fromDate(new Date(now.getTime() - 3 * 60 * 60000)) // 3 hours ago
    });

    const todo2Id = doc(collection(db, 'users', uid, 'actions')).id;
    batch.set(doc(db, 'users', uid, 'actions', todo2Id), {
        title: 'Review goals',
        done: false,
        createdAt: Timestamp.fromDate(new Date(now.getTime() - 1 * 60 * 60000)) // 1 hour ago
    });


    // --- 2. PENDING ACTIONS ---
    // 1 Pending (1 day old)
    const pending1Id = doc(collection(db, 'users', uid, 'actions')).id;
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    batch.set(doc(db, 'users', uid, 'actions', pending1Id), {
        title: 'Email weekly report',
        done: false,
        createdAt: Timestamp.fromDate(oneDayAgo)
    });

    // 1 Pending (7-8 days old)
    const pending2Id = doc(collection(db, 'users', uid, 'actions')).id;
    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
    batch.set(doc(db, 'users', uid, 'actions', pending2Id), {
        title: 'Clean workspace',
        done: false,
        createdAt: Timestamp.fromDate(eightDaysAgo)
    });


    // --- 3. HISTORY (COMPLETED TASKS) ---
    // Yesterday (2 tasks)
    const yest1Id = doc(collection(db, 'users', uid, 'actions')).id;
    const yestDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    batch.set(doc(db, 'users', uid, 'actions', yest1Id), {
        title: 'Workout 30 mins',
        done: true,
        createdAt: Timestamp.fromDate(new Date(yestDate.getTime() - 2 * 60 * 60000)),
        doneAt: Timestamp.fromDate(yestDate)
    });

    const yest2Id = doc(collection(db, 'users', uid, 'actions')).id;
    batch.set(doc(db, 'users', uid, 'actions', yest2Id), {
        title: 'Meditate',
        done: true,
        createdAt: Timestamp.fromDate(new Date(yestDate.getTime() - 5 * 60 * 60000)),
        doneAt: Timestamp.fromDate(new Date(yestDate.getTime() - 1 * 60 * 60000))
    });

    // 3-4 Days ago (1 task)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const old1Id = doc(collection(db, 'users', uid, 'actions')).id;
    batch.set(doc(db, 'users', uid, 'actions', old1Id), {
        title: 'Grocery shopping',
        done: true,
        createdAt: Timestamp.fromDate(new Date(threeDaysAgo.getTime() - 4 * 60 * 60000)),
        doneAt: Timestamp.fromDate(threeDaysAgo)
    });

    // 1 Week ago (2 tasks)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const old2Id = doc(collection(db, 'users', uid, 'actions')).id;
    batch.set(doc(db, 'users', uid, 'actions', old2Id), {
        title: 'Pay bills',
        done: true,
        createdAt: Timestamp.fromDate(new Date(weekAgo.getTime() - 10 * 60 * 60000)),
        doneAt: Timestamp.fromDate(weekAgo)
    });

    const old3Id = doc(collection(db, 'users', uid, 'actions')).id;
    batch.set(doc(db, 'users', uid, 'actions', old3Id), {
        title: 'Call mom',
        done: true,
        createdAt: Timestamp.fromDate(new Date(weekAgo.getTime() - 2 * 60 * 60000)),
        doneAt: Timestamp.fromDate(new Date(weekAgo.getTime() + 30 * 60000))
    });


    // --- 4. PERFORMANCE DOCUMENTS ---
    // Today
    batch.set(doc(db, 'users', uid, 'performance', todayKey), {
        date: todayKey,
        completed: 1,
        total: 3,
        ratio: 33,
        updatedAt: Date.now()
    }, { merge: true });

    // Yesterday
    batch.set(doc(db, 'users', uid, 'performance', yesterdayKey), {
        date: yesterdayKey,
        completed: 2,
        total: 2,
        ratio: 100,
        updatedAt: Date.now()
    }, { merge: true });

    // 3 Days ago
    const threeDaysKey = getTodayKeyUTC(threeDaysAgo);
    batch.set(doc(db, 'users', uid, 'performance', threeDaysKey), {
        date: threeDaysKey,
        completed: 1,
        total: 1,
        ratio: 100,
        updatedAt: Date.now()
    }, { merge: true });


    // --- 5. STREAK DOCUMENT ---
    batch.set(doc(db, 'users', uid, 'streak', 'info'), {
        current: 2,
        best: 2,
        previousStreak: 1,
        updatedAt: Date.now(),
        lastUpdatedKey: todayKey
    }, { merge: true });


    // --- 6. MOTIVATION DOCUMENT ---
    batch.set(doc(db, 'users', uid, 'motivation', todayKey), {
        text: "Your consistency is building momentum. Keep going.",
        date: todayKey,
        createdAt: Date.now()
    }, { merge: true });


    await batch.commit();
    console.log('✅ DEMO DATA SEEDED SUCCESSFULLY');
}

// Helper to match Service Logic
function getTodayKeyUTC(d: Date): string {
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getYesterdayKeyUTC(d: Date): string {
    const copy = new Date(d);
    copy.setUTCDate(copy.getUTCDate() - 1);
    return getTodayKeyUTC(copy);
}
