import { Component, effect, inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActionsService } from './services/actions.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Action } from './models/action.model';
import { DashboardService } from './services/dashboard.service';
import { AuthService } from './services/auth.service';
import { MotivationService } from './services/motivation.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  protected readonly title = signal('actify');
  protected readonly motivationText = signal('');
  actionTitle = new FormControl('');

  actionService = inject(ActionsService);
  auth = inject(AuthService);
  dashboard = inject(DashboardService);
  motivationServ = inject(MotivationService)
  actions: Action[] = [];

  constructor() {
    effect(async () => {
      if (this.auth.userId) {
        await this.dashboard.getTodayPerformance();
        await this.dashboard.getStreakInfo();
        const motivation = await this.motivationServ.getMotivation();
        this.motivationText.set(motivation);
      }
    })
  }

  get actionsSignal() {
    return this.actionService.actions();
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

  toggle(action: Action) {
    this.actionService.toggleDone(action);
  }

  get date() {
    return new Date();
  }
}
