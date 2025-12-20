import { Component, computed, inject } from '@angular/core';
import { ActionList } from "./action-list/action-list";
import { ActionsService } from '../../services/actions.service';

@Component({
  selector: 'app-actions-container',
  imports: [ActionList],
  templateUrl: './actions-container.html',
  styleUrl: './actions-container.scss',
})
export class ActionsContainer {

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

}
