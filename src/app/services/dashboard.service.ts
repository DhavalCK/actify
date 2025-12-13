import { Injectable, signal, effect } from "@angular/core";
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
        // Sync streak info from service to local signal
        effect(() => {
            const info = this.streakService.streakInfo();
            if (info) {
                this.bestStreak.set(info.best);
                this.currentStreak.set(info.current);
            }
        }, { allowSignalWrites: true });
    }

    async getTodayPerformance() {
        const snap = await this.performanceService.getPerfomanceDoc(this.performanceService.getTodayKey());
        if (snap?.exists()) {
            const { ratio } = snap.data();
            this.dailyRatio.set(ratio);
        }
    }

    async getStreakInfo() {
        // Initial fetch to populate the signal in service
        await this.streakService.getStreakInfo();
    }
}