import { Component, effect, inject, signal } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActionsService } from './services/actions.service';
import { Firestore } from '@angular/fire/firestore';
import { CommonModule, DatePipe } from '@angular/common';
import { Action } from './models/action.model';
import { DashboardService } from './services/dashboard.service';
import { AuthService } from './services/auth.service';
import { MotivationService } from './services/motivation.service';
import { Shell } from './components/shell/shell';
import { Header } from "./components/header/header";
import { BottomNav } from './components/bottom-nav/bottom-nav';
import { ActionInput } from "./components/actions-container/action-input/action-input";

const COMPONENTS = [
  Shell,
  Header,
  BottomNav,
  ActionInput
]

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    ...COMPONENTS
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  protected readonly title = signal('actify');
  isAddSheetOpen = signal(false);
  isDailyView = signal(true);

  router = inject(Router);

  actionService = inject(ActionsService);
  auth = inject(AuthService);
  dashboard = inject(DashboardService);
  motivationServ = inject(MotivationService)
  actions: Action[] = [];
  firestore = inject(Firestore);

  constructor() {
    effect(async () => {
      if (this.auth.userId) {
        await this.dashboard.getTodayPerformance();
        await this.dashboard.getStreakInfo();
        await this.motivationServ.getMotivation();
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isDailyView.set(event.urlAfterRedirects.includes('daily') || event.urlAfterRedirects === '/');
    });
  }

  toggleAddSheet(isOpen: boolean) {
    this.isAddSheetOpen.set(isOpen);
  }

  // To Test Demo Data
  async runSeed() {
    if (!this.auth.userId) {
      alert('Please login first (or wait for auth init)');
      return;
    }
    const { seedDemoData } = await import('./utils/seed-data');
    await seedDemoData(this.firestore, this.auth.userId);
  }
}
