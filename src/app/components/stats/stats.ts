import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../services/stats.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
    selector: 'app-stats',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stats.html',
})
export class Stats {
    statsService = inject(StatsService);
    dashboardService = inject(DashboardService);

    // Consistency
    // currentStreak = this.dashboardService.currentStreak;
    // bestStreak = this.dashboardService.bestStreak;

    // Consolidated Stats Computation
    stats = computed(() => {
        const s = this.statsService.stats();

        return {
            consistency: {
                currentStreak: this.dashboardService.currentStreak(),
                bestStreak: this.dashboardService.bestStreak()
            },
            completion: {
                average: Math.round(s.completionAverage)
            },
            procrastination: {
                averageTime: s.procAvgMs > 0 ? this.formatDuration(s.procAvgMs) : 'N/A',
                sameDay: Math.round(s.procSameDayPercent),
                later: 100 - Math.round(s.procSameDayPercent)
            },
            pending: {
                averageAge: s.pendingAvgAgeMs > 0 ? this.formatDuration(s.pendingAvgAgeMs) : '0 days',
                longest: s.pendingMaxAgeMs > 0 ? this.formatDuration(s.pendingMaxAgeMs) : '0 days'
            }
        };
    });

    private formatDuration(ms: number): string {
        const minutes = Math.floor(ms / (1000 * 60));
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes} min`;
        if (hours < 24) return `${hours} hrs`;
        return `${days} days`;
    }
}
