import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-stats',
  imports: [CommonModule],
  templateUrl: './dashboard-stats.html',
  styleUrl: './dashboard-stats.scss',
})
export class DashboardStats {

  dashboard = inject(DashboardService);

  ratio = this.dashboard.dailyRatio;


}
