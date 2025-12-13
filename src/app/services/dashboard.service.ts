import { Injectable, signal, effect } from "@angular/core";
import { PerformanceService } from "./performance.service";
import { StreakService } from "./streak.service";

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    readonly dailyRatio = signal(0);
    readonly currentStreak = signal(0);
    readonly bestStreak = signal(0);
    readonly todayLabel = new Date();

    constructor(
        private performanceService: PerformanceService,
        private streakService: StreakService
    ) {
        // Sync streak info from service to local signal
        effect(() => {
            const streakInfo = this.streakService.streakInfo();
            if (streakInfo) {
                this.bestStreak.set(streakInfo.best);
                this.currentStreak.set(streakInfo.current);
            }

            const performanceInfo = this.performanceService.performanceInfo();
            if (performanceInfo) {
                this.dailyRatio.set(performanceInfo.ratio);
            }
        }, { allowSignalWrites: true });
    }

    async getTodayPerformance() {
        // Initial fetch to populate the signal in performance service
        await this.performanceService.getPerfomanceDoc(this.performanceService.getTodayKey());
    }

    async getStreakInfo() {
        // Initial fetch to populate the signal in streak service
        await this.streakService.getStreakInfo();
    }
}