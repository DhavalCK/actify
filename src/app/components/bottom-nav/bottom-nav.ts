import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type Tab = 'daily' | 'history' | 'stats';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-0 left-0 right-0 flex items-center justify-around bg-white/80 backdrop-blur-md border-t border-slate-100/50 py-3 pb-safe z-50">
      <button (click)="select('daily')" 
              class="flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all duration-200 rounded-xl"
              [ngClass]="activeTab === 'daily' ? 'text-blue-600 bg-blue-50' : 'text-slate-400'">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span class="text-[10px] font-semibold">Daily</span>
      </button>

      <button (click)="select('history')" 
              class="flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all duration-200 rounded-xl"
              [ngClass]="activeTab === 'history' ? 'text-blue-600 bg-blue-50' : 'text-slate-400'">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-[10px] font-semibold">History</span>
      </button>

      <button (click)="select('stats')" 
              class="flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all duration-200 rounded-xl"
              [ngClass]="activeTab === 'stats' ? 'text-blue-600 bg-blue-50' : 'text-slate-400'">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="text-[10px] font-semibold">Stats</span>
      </button>
    </div>
  `
})
export class BottomNav {
  @Input() activeTab: Tab = 'daily';
  @Output() tabChange = new EventEmitter<Tab>();

  select(tab: Tab) {
    this.tabChange.emit(tab);
  }
}
