import { Injectable, signal } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { doc, getDoc, getFirestore, setDoc } from "@angular/fire/firestore";
import { AuthService } from "./auth.service";
import { PerformanceService } from "./performance.service";

@Injectable({
    providedIn: 'root'
})
export class StreakService {

    private db = getFirestore();

    constructor(
        private auth: AuthService,
        private performance: PerformanceService,
    ) { }

    // Reactive state for streak info
    readonly streakInfo = signal<{ current: number, best: number } | null>(null);

    // return whether yesterday had >= 1 completed action
    async getYesterdayStatus(): Promise<number> {
        const key = this.performance.getYesterdayKey();
        const snap = await this.performance.getPerfomanceDoc(key);
        if (!snap?.exists()) return 0;

        return (snap.data() as any)?.completed ?? 0;
    }

    async getStreakInfo() {
        const uid = this.auth?.userId;
        if (!uid) return null;

        const docRef = doc(this.db, 'users', uid, 'streak', 'info');
        try {
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data() as any;
                this.streakInfo.set({ current: data.current ?? 0, best: data.best ?? 0 });
                return snap;
            }
            return null;
        } catch (err) {
            console.error('getStreakInfo error', err);
            return null;
        }
    }

    // Pass whether today has >=1 completed action and Write Streak data
    async updateStreak(todayCompleted: boolean) {
        const uid = this.auth?.userId;
        if (!uid) return;

        const docRef = doc(this.db, 'users', uid, 'streak', 'info');

        // Read yesterday Status 
        const yesterdayCompleted = (await this.getYesterdayStatus()) > 0;

        // read existing streak doc
        let current = 0;
        let best = 0;
        let previousStreak = 0;
        let lastUpdatedTs = 0;

        try {
            const sSnap = await getDoc(docRef);
            if (sSnap && sSnap.exists()) {
                const d = sSnap.data() as any;
                current = d.current ?? 0;
                best = d.best ?? 0;
                previousStreak = d.previousStreak ?? 0;
                lastUpdatedTs = d.updatedAt ?? 0;
            }
        } catch (err) {
            console.error('updateStreak: error reading streak info', err);
        }

        // helper: same-day check
        const todayKey = this.performance.getTodayKey();
        const d = new Date(lastUpdatedTs || 0);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const lastUpdatedDateKey = lastUpdatedTs ? `${year}-${month}-${day}` : null;

        const alreadyUpdatedToday = lastUpdatedDateKey === todayKey;

        // Streak Logic
        if (!alreadyUpdatedToday) {
            // First update of the day
            // If yesterday was completed, our "base" streak is whatever current was.
            // If yesterday was NOT completed, our "base" streak is 0.
            previousStreak = yesterdayCompleted ? current : 0;
        }

        // Calculate new current based on previousStreak
        if (todayCompleted) {
            current = previousStreak + 1;
        } else {
            // If not completed today (yet, or undone), we revert to previousStreak.
            // This shows the "pending" streak (e.g. 5) instead of 0.
            current = previousStreak;
        }

        best = Math.max(best, current);

        // Update reactive state
        this.streakInfo.set({ current, best });

        // persist
        try {
            await setDoc(docRef, {
                current,
                best,
                previousStreak,
                updatedAt: Date.now()
            }, { merge: true });
        } catch (err) {
            console.error('updateStreak: error saving streak', err);
        }
    }

}