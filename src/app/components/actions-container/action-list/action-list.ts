import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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

  get actionsSignal() {
    return this.actionService.actions();
  }

  remove(id: string) {
    this.actionService.remove(id);
  }

  toggle(action: Action) {
    this.actionService.toggleDone(action);
  }

}
