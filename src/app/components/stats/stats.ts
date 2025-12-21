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
    currentStreak = this.dashboardService.currentStreak;
    bestStreak = this.dashboardService.bestStreak;

    // Completion Performance
    completionStats = computed(() => {
        const actions = this.actionsService.actions();
        if (actions.length === 0) return { average: 0 };

        const actionsByDate = new Map<string, { total: number; completed: number }>();

        actions.forEach(action => {
            const date = new Date(action.createdAt).toLocaleDateString();
            const entry = actionsByDate.get(date) || { total: 0, completed: 0 };
            entry.total++;
            if (action.done) entry.completed++;
            actionsByDate.set(date, entry);
        });

        let totalPercentage = 0;
        actionsByDate.forEach(entry => {
            totalPercentage += (entry.completed / entry.total) * 100;
        });

        const average = Math.round(totalPercentage / actionsByDate.size);
        return { average };
    });

    // Procrastination Insight
    procrastinationStats = computed(() => {
        const actions = this.actionsService.actions().filter(a => a.done && a.doneAt);
        if (actions.length === 0) return { averageTime: 'N/A', sameDay: 0, later: 0 };

        let totalDuration = 0;
        let sameDayCount = 0;

        actions.forEach(action => {
            const created = new Date(action.createdAt);
            const done = new Date(action.doneAt!);

            // Duration
            totalDuration += (action.doneAt! - action.createdAt);

            // Same day check
            if (created.toDateString() === done.toDateString()) {
                sameDayCount++;
            }
        });

        const avgMs = totalDuration / actions.length;
        const sameDay = Math.round((sameDayCount / actions.length) * 100);

        return {
            averageTime: this.formatDuration(avgMs),
            sameDay,
            later: 100 - sameDay
        };
    });

    // Pending Behavior
    pendingStats = computed(() => {
        const pendingActions = this.actionsService.actions().filter(a => !a.done);
        if (pendingActions.length === 0) return { averageAge: '0 days', longest: '0 days' };

        const now = Date.now();
        let totalAge = 0;
        let maxAge = 0;

        pendingActions.forEach(action => {
            const age = now - action.createdAt;
            totalAge += age;
            if (age > maxAge) maxAge = age;
        });

        const avgAgeMs = totalAge / pendingActions.length;

        return {
            averageAge: this.formatDuration(avgAgeMs),
            longest: this.formatDuration(maxAge)
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
