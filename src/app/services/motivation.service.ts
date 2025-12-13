import { inject, Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { doc, Firestore, getDoc, serverTimestamp, setDoc } from "@angular/fire/firestore";
import { PerformanceService } from "./performance.service";
import { StreakService } from "./streak.service";

@Injectable({
    providedIn: 'root'
})
export class MotivationService {

    private db: Firestore;
    private auth: AuthService;
    private performanceService = inject(PerformanceService);
    private streakService = inject(StreakService);

    constructor() {
        AuthService
        this.auth = inject(AuthService);
        this.db = inject(Firestore);
    }

    async getMotivation() {
        if (!this.auth.userId) return;
        const dateKey = this.performanceService.getTodayKey();

        const docRef = doc(this.db, 'users', this.auth.userId, 'motivation', dateKey);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
            const data = snap.data() as any;
            return data?.text;
        }

        await fetch("/.netlify/functions/generate-motivation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                uid: this.auth.userId,
                dateKey
            })
        });

        const freshSnap = await getDoc(docRef);
        return (freshSnap.data() as any)?.text ?? '';


    }
}