import { Injectable, signal } from "@angular/core";
import { PerformanceService } from "./performance.service";
import { StreakService } from "./streak.service";

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    readonly dailyRatio = signal('0');
    readonly currentStreak = signal(0);
    readonly bestStreak = signal(0);
    readonly todayLabel = new Date();

    constructor(
        private performanceService: PerformanceService,
        private streakService: StreakService
    ) {
    }

    async getTodayPerformance() {
        const snap = await this.performanceService.getPerfomanceDoc(this.performanceService.getTodayKey());
        if (snap?.exists()) {
            const { ratio } = snap.data();
            this.dailyRatio.set(ratio);
        }
    }

    async getStreakInfo() {
        const snap = await this.streakService.getStreakInfo();
        if (snap?.exists()) {
            const { best, current } = snap.data();
            this.bestStreak.set(best);
            this.currentStreak.set(current);
        }
    }
}