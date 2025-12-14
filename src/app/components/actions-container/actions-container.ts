import { Component } from '@angular/core';
import { ActionInput } from "./action-input/action-input";
import { ActionList } from "./action-list/action-list";

@Component({
  selector: 'app-actions-container',
  imports: [ActionInput, ActionList],
  templateUrl: './actions-container.html',
  styleUrl: './actions-container.scss',
})
export class ActionsContainer {

}
