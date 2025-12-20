import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type Tab = 'daily' | 'history';

@Component({
    selector: 'app-bottom-nav',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="flex items-center justify-around bg-white border-t border-slate-100 py-1.5 pb-safe">
      <button (click)="select('daily')" 
              class="flex flex-col items-center gap-1 p-1.5 min-w-[64px] transition-all duration-200 rounded-xl"
              [ngClass]="activeTab === 'daily' ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span class="text-[10px] font-semibold">Daily</span>
      </button>

      <button (click)="select('history')" 
              class="flex flex-col items-center gap-1 p-1.5 min-w-[64px] transition-all duration-200 rounded-xl"
              [ngClass]="activeTab === 'history' ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-[10px] font-semibold">History</span>
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
