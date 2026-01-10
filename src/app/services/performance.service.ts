import { Injectable, signal } from "@angular/core";
import { AuthService } from "./auth.service";
import { doc, DocumentSnapshot, getDoc, getFirestore, setDoc } from "@angular/fire/firestore";

@Injectable({
    providedIn: 'root'
})
export class PerformanceService {

    private db = getFirestore();

    constructor(
        private auth: AuthService,
    ) { }

    // Reactive state for performance info
    readonly performanceInfo = signal<{ ratio: number } | null>(null);

    // Save today's performance under: users/{uid}/performance/{YYYY-MM-DD}
    async saveToday(completed: number, total: number) {
        const uid = this.auth.userId;

        if (!uid) {
            console.warn('PerformanceService.saveToday: no uid yet');
            return;
        }

        // Use UTC key for consistency across timezones
        const dateKey = this.getTodayKeyUTC();
        const ratio = total === 0 ? 0 : Math.round((completed / total) * 100);

        try {
            const docRef = doc(this.db, 'users', uid, 'performance', dateKey);

            const data = {
                date: dateKey,
                completed,
                total,
                ratio,
                updatedAt: Date.now()
            }
            await setDoc(docRef, data, { merge: true });
            this.performanceInfo.set(data);

        } catch (err) {
            console.error('PerformanceService.saveToday error', err);
        }
    }

    // Returns DocumentSnapshot | null
    async getPerfomanceDoc(dateKey: string): Promise<DocumentSnapshot | null> {
        const uid = this.auth.userId;

        if (!uid) {
            console.warn('PerformanceService.getPerfomanceDoc: no uid yet');
            return null;
        }

        try {
            const docRef = doc(this.db, 'users', uid, 'performance', dateKey);
            const snap = await getDoc(docRef);
            if (snap?.exists()) {
                const { date, ratio } = snap?.data();
                // Check against UTC key
                if (this.getTodayKeyUTC() === date) {
                    this.performanceInfo.set({
                        ratio: ratio
                    });
                }
            }
            return snap;
        } catch (err) {
            console.error('Get Performance Error: ', err);
            return null;
        }
    }

    // Return Today date key (YYYY-MM-DD) in Local Time - DEPRECATED but kept for migration
    private todayKey(): string {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private yesterdayKey(): string {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // UTC Helpers for Timezone Independent Streaks
    public getTodayKeyUTC(): string {
        const d = new Date();
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    public getYesterdayKeyUTC(): string {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() - 1);
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Expose keys to use elsewhere
    public getTodayKey() { return this.todayKey(); }
    public getYesterdayKey() { return this.yesterdayKey(); }

}