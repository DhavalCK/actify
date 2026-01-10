import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionsService } from '../../services/actions.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
    selector: 'app-stats',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stats.html',
})
export class Stats {
    actionsService = inject(ActionsService);
    dashboardService = inject(DashboardService);

    // Consistency
    // currentStreak = this.dashboardService.currentStreak;
    // bestStreak = this.dashboardService.bestStreak;

    // Consolidated Stats Computation
    stats = computed(() => {
        const actions = this.actionsService.actions();
        const now = Date.now();

        // Initial State
        const actionsByDate = new Map<string, { total: number; completed: number }>();
        let procTotalDuration = 0;
        let procSameDayCount = 0;
        let procCount = 0;
        let pendingTotalAge = 0;
        let pendingMaxAge = 0;
        let pendingCount = 0;

        // Single Pass Loop
        actions.forEach(action => {
            // 1. Completion Stats Data
            const date = new Date(action.createdAt).toLocaleDateString();
            const entry = actionsByDate.get(date) || { total: 0, completed: 0 };
            entry.total++;
            if (action.done) entry.completed++;
            actionsByDate.set(date, entry);

            // 2. Procrastination Stats Data
            if (action.done && action.doneAt) {
                procCount++;
                procTotalDuration += (action.doneAt - action.createdAt);
                const created = new Date(action.createdAt);
                const done = new Date(action.doneAt);
                if (created.toDateString() === done.toDateString()) {
                    procSameDayCount++;
                }
            }

            // 3. Pending Stats Data
            if (!action.done) {
                pendingCount++;
                const age = now - action.createdAt;
                pendingTotalAge += age;
                if (age > pendingMaxAge) pendingMaxAge = age;
            }
        });

        // Calculate Completion
        let totalPercentage = 0;
        if (actionsByDate.size > 0) {
            actionsByDate.forEach(entry => {
                totalPercentage += (entry.completed / entry.total) * 100;
            });
        }
        const completionAverage = actionsByDate.size > 0 ? Math.round(totalPercentage / actionsByDate.size) : 0;

        // Calculate Procrastination
        const procAvgMs = procCount > 0 ? procTotalDuration / procCount : 0;
        const procSameDay = procCount > 0 ? Math.round((procSameDayCount / procCount) * 100) : 0;

        // Calculate Pending
        const pendingAvgAgeMs = pendingCount > 0 ? pendingTotalAge / pendingCount : 0;

        return {
            consistency: {
                currentStreak: this.dashboardService.currentStreak(),
                bestStreak: this.dashboardService.bestStreak()
            },
            completion: {
                average: completionAverage
            },
            procrastination: {
                averageTime: procCount > 0 ? this.formatDuration(procAvgMs) : 'N/A',
                sameDay: procSameDay,
                later: 100 - procSameDay
            },
            pending: {
                averageAge: pendingCount > 0 ? this.formatDuration(pendingAvgAgeMs) : '0 days',
                longest: pendingCount > 0 ? this.formatDuration(pendingMaxAge) : '0 days'
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
