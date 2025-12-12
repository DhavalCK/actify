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
    async getYesterdayStatus() {
        const key = this.performance.getYesterdayKey();
        let yesterdayCompleted = false;
        try {
            const snap = await this.performance.getPerfomanceDoc(key);
            if (snap?.exists()) {
                yesterdayCompleted = ((snap.data() as any)?.completed ?? 0) >= 1;
            }

        } catch (err) {
            console.log('Failed to get Yestreday status ', err);
            return null;
        }
        return yesterdayCompleted;
    }

    async getStreakInfo() {
        const uid = this.auth?.currentUid;
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
        const uid = this.auth?.currentUid;
        if (!uid) return;

        const docRef = doc(this.db, 'users', uid, 'streak', 'info');
        // Read yesterday Status 
        const yesterdayCompleted = await this.getYesterdayStatus();

        let streakInfo = await this.getStreakInfo();
        let current = streakInfo?.get('current') || 0;
        let best = streakInfo?.get('best') || 0;
        // Streak Logic
        if (todayCompleted) {
            // if yesterday had >=1, increment, else start 1
            current = yesterdayCompleted ? current += 1 : 1;
            best = Math.max(best, current);
        } else {
            current = 0;
        }

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