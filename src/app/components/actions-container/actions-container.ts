import { Component, computed, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActionList } from "./action-list/action-list";
import { ActionsService } from '../../services/actions.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-actions-container',
  imports: [ActionList, CommonModule],
  templateUrl: './actions-container.html',
  styleUrl: './actions-container.scss',
})
export class ActionsContainer implements AfterViewInit {

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  actionService = inject(ActionsService);

  todayActions = computed(() => this.actionsSignal.filter((action) => {
    return action.createdAt >= this.actionService.todayStartDate.getTime();
  }));

  pendingActions = computed(() => this.actionsSignal.filter((action) => {
    return action.createdAt < this.actionService.todayStartDate.getTime() && !action.done;
  }))

  get actionsSignal() {
    return this.actionService.actions();
  }

  get isLoading() {
    return this.actionService.isLoading();
  }

  get hasMore() {
    return this.actionService.hasMore();
  }

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
    if (scrollHeight - scrollPosition < 200 && this.hasMore && !this.isLoading) {
      this.actionService.loadMoreActions();
    }
  }

}
