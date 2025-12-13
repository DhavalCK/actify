import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { doc, DocumentSnapshot, getDoc, getFirestore, setDoc } from "@angular/fire/firestore";

@Injectable({
    providedIn: 'root'
})
export class PerformanceService {

    private db = getFirestore();

    constructor(private auth: AuthService) { }

    // Save today's performance under: users/{uid}/performance/{YYYY-MM-DD}
    async saveToday(completed: number, total: number) {
        const uid = this.auth.userId;

        if (!uid) {
            console.warn('PerformanceService.saveToday: no uid yet');
            return;
        }

        const dateKey = this.todayKey();
        const ratio = total === 0 ? 0 : Math.round((completed / total) * 100);

        try {
            const docRef = doc(this.db, 'users', uid, 'performance', dateKey);

            await setDoc(docRef, {
                date: dateKey,
                completed,
                total,
                ratio,
                updatedAt: Date.now()
            }, { merge: true })

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
            return snap;
        } catch (err) {
            console.error('Get Performance Error: ', err);
            return null;
        }
    }

    // Return Today date key (YYYY-MM-DD) 
    private todayKey(): string {
        return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    }

    private yesterdayKey(): string {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().slice(0, 10); // YYYY-MM-DD
    }

    // Expose keys to use elsewhere
    public getTodayKey() { return this.todayKey(); }
    public getYesterdayKey() { return this.yesterdayKey(); }

}