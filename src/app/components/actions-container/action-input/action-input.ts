import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActionsService } from '../../../services/actions.service';

@Component({
  selector: 'app-action-input',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './action-input.html',
  styleUrl: './action-input.scss',
})
export class ActionInput {
  actionTitle = new FormControl('');

  actionService: ActionsService = inject(ActionsService);

  // Add action
  onSubmit() {
    const title = this.actionTitle.value?.trim() || '';
    if (!title) return;
    this.actionService.add(title);
    this.actionTitle.reset();
  }

}
