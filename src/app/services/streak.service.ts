import { Injectable } from "@angular/core";
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
        private performance: PerformanceService
    ) { }

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
            return snap.exists() ? snap : null;
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
        const yesterdayCompleted = (await this.getYesterdayStatus()) || 0;

        // read existing streak doc
        let current = 0;
        let best = 0;
        let lastUpdatedTs = 0;
        try {
            const sSnap = await getDoc(docRef);
            if (sSnap && sSnap.exists()) {
                const d = sSnap.data() as any;
                current = d.current ?? 0;
                best = d.best ?? 0;
                lastUpdatedTs = d.updatedAt ?? 0;
            }
        } catch (err) {
            console.error('updateStreak: error reading streak info', err);
        }

        // helper: same-day check
        const todayKey = this.performance.getTodayKey();
        const lastUpdatedKey = lastUpdatedTs ? new Date(lastUpdatedTs).toISOString().slice(0, 10) : null;
        const alreadyUpdatedToday = lastUpdatedKey === todayKey;

        // Streak Logic
        if (alreadyUpdatedToday) {
            // idempotent: don't increment again today
            if (todayCompleted) {
                // keep current as-is (no increment). If stored current is 0 but todayCompleted true,
                // that's an edge case — treat as current = 1
                if (current <= 0) current = 1;
                best = Math.max(best, current);
            } else {
                // today has no completed actions -> reset
                current = 0;
            }
        } else {
            // first update today
            if (todayCompleted) {
                // if yesterday had >=1, we continue streak; otherwise start at 1
                current = (yesterdayCompleted >= 1) ? (current + 1) : 1;
                best = Math.max(best, current);
            } else {
                current = 0;
            }
        }

        // persist
        try {

            await setDoc(docRef, {
                current,
                best,
                updatedAt: Date.now()
            }, { merge: true });
        } catch (err) {
            console.error('updateStreak: error saving streak', err);
        }
    }

}