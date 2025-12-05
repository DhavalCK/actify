import { Component, effect, inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActionsService } from './services/actions.service';
import { CommonModule } from '@angular/common';
import { Action } from './models/action.model';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  protected readonly title = signal('actify');
  actionTitle = new FormControl('');

  private actionService = inject(ActionsService);
  actions: Action[] = [];

  constructor() {
    effect(() => {
      this.actions = this.actionService.actions();
    });
  }

  add() {
    const title = this.actionTitle.value?.trim() || '';
    if (!title) return;
    this.actionService.add(title);
    this.actionTitle.reset();
  }

  remove(id: string) {
    this.actionService.remove(id);
  }

  toggle(id: string) {
    this.actionService.toggleDone(id);
  }
}
