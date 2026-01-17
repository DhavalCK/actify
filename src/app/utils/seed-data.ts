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

    // helper
    const actionsCol = collection(db, 'users', uid, 'actions');

    const createAction = (data: {
        title: string;
        createdAt: Date;
        done?: boolean;
        doneAt?: Date | null;
    }) => {
        const id = doc(actionsCol).id;

        batch.set(doc(db, 'users', uid, 'actions', id), {
            title: data.title,
            done: !!data.done,
            createdAt: Timestamp.fromDate(data.createdAt),
            ...(data.done
                ? { doneAt: data.doneAt ? Timestamp.fromDate(data.doneAt) : Timestamp.fromDate(data.createdAt) }
                : {}),
        });
    };

    // ---------- 1) TODAY ACTIONS (Mix Done + Pending) ----------
    // Done (completed)
    createAction({
        title: '✅ Plan the day (Top 3 priorities)',
        createdAt: new Date(now.getTime() - 6 * 60 * 60000), // 6 hours ago
        done: true,
        doneAt: new Date(now.getTime() - 5 * 60 * 60000), // 5 hours ago
    });

    createAction({
        title: '🏃 Workout 25 minutes',
        createdAt: new Date(now.getTime() - 4 * 60 * 60000),
        done: true,
        doneAt: new Date(now.getTime() - 3.5 * 60 * 60000),
    });

    createAction({
        title: '💧 Drink 2L water',
        createdAt: new Date(now.getTime() - 10 * 60 * 60000),
        done: true,
        doneAt: new Date(now.getTime() - 2 * 60 * 60000),
    });

    // Pending
    createAction({
        title: '📚 Read 10 minutes',
        createdAt: new Date(now.getTime() - 3 * 60 * 60000),
        done: false,
    });

    createAction({
        title: '🧠 Review goals & write 1 improvement',
        createdAt: new Date(now.getTime() - 2.2 * 60 * 60000),
        done: false,
    });

    createAction({
        title: '⚡ Learn English — speak 10 sentences',
        createdAt: new Date(now.getTime() - 90 * 60000),
        done: false,
    });

    createAction({
        title: '👨‍💻 Side hustle: 1 hour freelance learning',
        createdAt: new Date(now.getTime() - 30 * 60000),
        done: false,
    });

    // Long title (UI overflow test)
    createAction({
        title:
            'Long Title Test: Fix Angular UI bugs related to History Page scrolling + rendering (ensure stable UI across mobile + desktop)',
        createdAt: new Date(now.getTime() - 70 * 60000),
        done: false,
    });

    // Duplicate title case
    createAction({
        title: 'Daily Review',
        createdAt: new Date(now.getTime() - 120 * 60000),
        done: false,
    });

    createAction({
        title: 'Daily Review',
        createdAt: new Date(now.getTime() - 11 * 60 * 60000),
        done: true,
        doneAt: new Date(now.getTime() - 10.5 * 60 * 60000),
    });

    // ---------- 2) YESTERDAY ACTIONS ----------
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    createAction({
        title: '✅ Meditate 10 minutes',
        createdAt: new Date(yesterday.getTime() - 6 * 60 * 60000),
        done: true,
        doneAt: new Date(yesterday.getTime() - 5.5 * 60 * 60000),
    });

    createAction({
        title: '✅ Complete 1 interview JS question',
        createdAt: new Date(yesterday.getTime() - 4 * 60 * 60000),
        done: true,
        doneAt: new Date(yesterday.getTime() - 3.8 * 60 * 60000),
    });

    createAction({
        title: 'Pending: Journal 5 lines',
        createdAt: new Date(yesterday.getTime() - 2 * 60 * 60000),
        done: false,
    });

    // ---------- 3) OLD PENDING / OVERDUE TASKS ----------
    // 2 days ago
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    createAction({
        title: '🚨 Pay electricity bill',
        createdAt: new Date(twoDaysAgo.getTime() + 3 * 60 * 60000),
        done: false,
    });

    // 3 days ago
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    createAction({
        title: '📦 Clean workspace (desk reset)',
        createdAt: new Date(threeDaysAgo.getTime() + 6 * 60 * 60000),
        done: false,
    });

    // 5 days ago
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    createAction({
        title: '🧾 Submit documents for office',
        createdAt: new Date(fiveDaysAgo.getTime() + 2 * 60 * 60000),
        done: false,
    });

    // 8 days ago
    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
    createAction({
        title: 'Call mom',
        createdAt: new Date(eightDaysAgo.getTime() + 4 * 60 * 60000),
        done: false,
    });

    // 12 days ago
    const twelveDaysAgo = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000);
    createAction({
        title: '🧹 Deep clean room',
        createdAt: new Date(twelveDaysAgo.getTime() + 5 * 60 * 60000),
        done: false,
    });

    // ---------- 4) HISTORY COMPLETED TASKS (OLD DONE TASKS) ----------
    // 4 days ago
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    createAction({
        title: '✅ Grocery shopping',
        createdAt: new Date(fourDaysAgo.getTime() + 2 * 60 * 60000),
        done: true,
        doneAt: new Date(fourDaysAgo.getTime() + 5 * 60 * 60000),
    });

    // 6 days ago
    const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    createAction({
        title: '✅ Fix routing issue in Angular project',
        createdAt: new Date(sixDaysAgo.getTime() + 1 * 60 * 60000),
        done: true,
        doneAt: new Date(sixDaysAgo.getTime() + 1.8 * 60 * 60000),
    });

    // 7 days ago
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    createAction({
        title: '✅ Send weekly report email',
        createdAt: new Date(weekAgo.getTime() + 2 * 60 * 60000),
        done: true,
        doneAt: new Date(weekAgo.getTime() + 3 * 60 * 60000),
    });

    createAction({
        title: '✅ Learn 1 new Tailwind component',
        createdAt: new Date(weekAgo.getTime() + 7 * 60 * 60000),
        done: true,
        doneAt: new Date(weekAgo.getTime() + 8 * 60 * 60000),
    });

    // 10 days ago
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    createAction({
        title: '✅ Read Bhagavad Gita (1 shloka)',
        createdAt: new Date(tenDaysAgo.getTime() + 6 * 60 * 60000),
        done: true,
        doneAt: new Date(tenDaysAgo.getTime() + 6.5 * 60 * 60000),
    });

    // 14 days ago
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    createAction({
        title: '✅ Update resume + LinkedIn profile',
        createdAt: new Date(fourteenDaysAgo.getTime() + 4 * 60 * 60000),
        done: true,
        doneAt: new Date(fourteenDaysAgo.getTime() + 6 * 60 * 60000),
    });

    // ---------- 5) PERFORMANCE DOCUMENTS ----------
    // Today (example values, you can tune)
    batch.set(
        doc(db, 'users', uid, 'performance', todayKey),
        {
            date: todayKey,
            completed: 4,
            total: 10,
            ratio: 40,
            updatedAt: Date.now(),
        },
        { merge: true }
    );

    // Yesterday
    batch.set(
        doc(db, 'users', uid, 'performance', yesterdayKey),
        {
            date: yesterdayKey,
            completed: 2,
            total: 3,
            ratio: 66,
            updatedAt: Date.now(),
        },
        { merge: true }
    );

    // 4 days ago
    const fourDaysKey = getTodayKeyUTC(fourDaysAgo);
    batch.set(
        doc(db, 'users', uid, 'performance', fourDaysKey),
        {
            date: fourDaysKey,
            completed: 1,
            total: 2,
            ratio: 50,
            updatedAt: Date.now(),
        },
        { merge: true }
    );

    // ---------- 6) STREAK DOCUMENT ----------
    batch.set(
        doc(db, 'users', uid, 'streak', 'info'),
        {
            current: 3,
            best: 5,
            previousStreak: 2,
            updatedAt: Date.now(),
            lastUpdatedKey: todayKey,
        },
        { merge: true }
    );

    // ---------- 7) MOTIVATION DOCUMENT ----------
    batch.set(
        doc(db, 'users', uid, 'motivation', todayKey),
        {
            text: 'Your focus is your power. One task at a time.',
            date: todayKey,
            createdAt: Date.now(),
        },
        { merge: true }
    );

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
