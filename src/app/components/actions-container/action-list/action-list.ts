import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { ActionsService } from '../../../services/actions.service';
import { Action } from '../../../models/action.model';

@Component({
  selector: 'app-action-list',
  imports: [CommonModule],
  templateUrl: './action-list.html',
  styleUrl: './action-list.scss',
})
export class ActionList {

  actionService = inject(ActionsService);
  todayActions = computed(() => this.actionsSignal.filter((action) => {
    return action.createdAt >= this.todayStartDate.getTime();
  }));

  pendingActions = computed(() => this.actionsSignal.filter((action) => {
    return action.createdAt < this.todayStartDate.getTime() && !action.done;
  }))

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
}
