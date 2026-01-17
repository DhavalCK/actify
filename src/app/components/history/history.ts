import { Component, computed, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { HistoryService } from '../../services/history.service';
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
  historyService = inject(HistoryService);
  datePipe = inject(DatePipe);

  groupedActions = computed(() => {
    const actions = this.historyService.historyActions();
    const actionsMap = new Map<string, Action[]>();

    actions.forEach((action) => {
      // Group by doneAt (fallback to createdAt if missing, though query ensures done=true)
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

    // Sort actions within groups by doneAt descending
    sortedGroups.forEach(group => {
      group[1].sort((a, b) => {
        const timeA = a.doneAt || a.createdAt;
        const timeB = b.doneAt || b.createdAt;
        return timeB - timeA;
      });
    });

    return sortedGroups;
  });

  ngOnInit() {
    // Reload history when entering the view to ensure freshness
    this.historyService.loadInitialHistory();
  }

  ngAfterViewInit() {
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
    if (scrollHeight - scrollPosition < 200 && this.historyService.hasMore() && !this.historyService.isLoading()) {
      this.historyService.loadMoreHistoryActions();
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
