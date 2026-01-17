import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, Input, signal } from '@angular/core';
import { ActionsService } from '../../../services/actions.service';
import { Action } from '../../../models/action.model';

@Component({
  selector: 'app-action-list',
  imports: [CommonModule],
  templateUrl: './action-list.html',
  styleUrl: './action-list.scss',
})
export class ActionList {

  @Input() actions: Action[] = [];
  @Input() title: string = '';
  @Input() type: 'today' | 'pending' | 'done' = 'today';
  @Input() page: 'daily' | 'history' = 'daily';

  actionService = inject(ActionsService);

  get isToday() {
    return this.type === 'today';
  }

  get isPending() {
    return this.type === 'pending';
  }

  get isDone() {
    return this.type === 'done';
  }

  constructor() {
  }

  get actionsSignal() {
    return this.actionService.actions();
  }

  get todayStartDate(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  remove(id: string) {
    this.actionService.remove(id);
  }

  toggle(action: Action) {
    this.actionService.toggleDone(action);
  }

  getDayCount(action: Action) {
    const today = this.todayStartDate;
    const actionDate = new Date(action.createdAt);
    actionDate.setHours(0, 0, 0, 0);
    const days = (today.getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.floor(days);
  }

  getUrgencyClasses(days: number): string {
    if (days <= 2) {
      return 'bg-orange-50 text-orange-600 border-orange-200'; // Very light warm
    } else if (days <= 4) {
      return 'bg-orange-100 text-orange-700 border-orange-300'; // Soft orange
    } else {
      return 'bg-red-50 text-red-700 border-red-200'; // Muted red
    }
  }

  getDurationString(action: Action): string | null {
    if (!action.doneAt || !action.createdAt) return null;

    const durationMs = action.doneAt - action.createdAt;
    if (durationMs < 0) return null;

    const minutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} min`;
    } else if (hours < 24) {
      return `${hours} hrs`;
    } else if (days < 7) {
      return `${days} days`;
    } else {
      const weeks = (days / 7).toFixed(1).replace('.0', '');
      return `${weeks} weeks`;
    }
  }
}
