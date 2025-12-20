import { Component, computed, inject } from '@angular/core';
import { ActionsService } from '../../services/actions.service';
import { ActionList } from "../actions-container/action-list/action-list";
import { CommonModule, DatePipe } from '@angular/common';
import { Action } from '../../models/action.model';

@Component({
  selector: 'app-history',
  imports: [CommonModule, ActionList],
  providers: [DatePipe],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History {

  actionService = inject(ActionsService);
  datePipe = inject(DatePipe);

  groupedActions = computed(() => {
    const actions = this.actionService.actions();
    const completedActions = actions.filter(action => action.done);

    const actionsMap = new Map<string, Action[]>();

    completedActions.forEach((action) => {
      const date = new Date(action.createdAt).toLocaleDateString();
      const list = actionsMap.get(date) || [];
      list.push(action);
      actionsMap.set(date, list);
    });

    const sorted = Array.from(actionsMap).sort((a, b) => {
      return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    });

    return sorted;
  });

  isToday(date: Date): boolean {
    const today = new Date();
    return today.getFullYear() === date.getFullYear() &&
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth();
  }

  isYesterday(date: Date): boolean {
    const yesterday = new Date();
    yesterday.setDate(new Date().getDate() - 1);

    return yesterday.getFullYear() === date.getFullYear() &&
      yesterday.getDate() === date.getDate() &&
      yesterday.getMonth() === date.getMonth();
  }

  getTitle(date: string) {
    const parsedDate = new Date(date);
    if (this.isToday(parsedDate)) {
      return 'Today';
    } else if (this.isYesterday(parsedDate)) {
      return 'Yesterday';
    }
    return this.datePipe.transform(date, 'dd MMM') || '';
  }
}
