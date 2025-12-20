import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActionsService } from './services/actions.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Action } from './models/action.model';
import { DashboardService } from './services/dashboard.service';
import { AuthService } from './services/auth.service';
import { MotivationService } from './services/motivation.service';
import { Shell } from './components/shell/shell';
import { Header } from "./components/header/header";
import { Motivation } from './components/motivation/motivation';
import { ActionsContainer } from './components/actions-container/actions-container';
import { DashboardStats } from "./components/dashboard-stats/dashboard-stats";

import { BottomNav, Tab } from './components/bottom-nav/bottom-nav';
import { History } from "./components/history/history";

const COMPONENTS = [
  Shell,
  Header,
  Motivation,
  DashboardStats,
  ActionsContainer,
  BottomNav,
]

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    ...COMPONENTS,
    History
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  protected readonly title = signal('actify');
  currentView = signal<Tab>('daily');

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
        await this.motivationServ.getMotivation();
      }
    })
  }
}
