import { Component, computed, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
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
export class History implements AfterViewInit {

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  actionService = inject(ActionsService);
  datePipe = inject(DatePipe);

  // Optimization: Intermediate signal to filter completed actions
  // Uses custom equality check to prevent downstream recalculations when 
  // pending actions change or when Firestore emits new object references for unchanged data
  completedActions = computed(() => {
    return this.actionService.actions().filter(a => a.done);
  }, {
    equal: (a: Action[], b: Action[]) => {
      if (a === b) return true;
      if (a.length !== b.length) return false;
      // Check if content is effectively the same (ignoring object identity)
      return a.every((action, index) =>
        action.id === b[index].id &&
        action.doneAt === b[index].doneAt &&
        action.createdAt === b[index].createdAt
      );
    }
  });

  groupedActions = computed(() => {
    const completedActions = this.completedActions();

    const actionsMap = new Map<string, Action[]>();

    completedActions.forEach((action) => {
      const timestamp = action.doneAt || action.createdAt;
      const date = new Date(timestamp).toLocaleDateString();
      const list = actionsMap.get(date) || [];
      list.push(action);
      actionsMap.set(date, list);
    });

    // Sort groups by date descending
    const sortedGroups = Array.from(actionsMap).sort((a, b) => {
      return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    });

    // Sort actions within groups by time descending
    sortedGroups.forEach(group => {
      group[1].sort((a, b) => {
        const timeA = a.doneAt || a.createdAt;
        const timeB = b.doneAt || b.createdAt;
        return timeB - timeA;
      });
    });

    return sortedGroups;
  });

  ngAfterViewInit() {
    // Add scroll listener for infinite scroll
    this.scrollContainer?.nativeElement?.addEventListener('scroll', () => {
      this.onScroll();
    });
  }

  onScroll() {
    const element = this.scrollContainer?.nativeElement;
    if (!element) return;

    const scrollPosition = element.scrollTop + element.clientHeight;
    const scrollHeight = element.scrollHeight;

    // Trigger load more when user is 200px from bottom
    if (scrollHeight - scrollPosition < 200 && this.actionService.hasMore() && !this.actionService.isLoading()) {
      this.actionService.loadMoreActions();
    }
  }

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
