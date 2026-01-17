import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'daily', pathMatch: 'full' },
    {
        path: 'daily',
        loadComponent: () => import('./components/actions-container/actions-container').then(m => m.ActionsContainer)
    },
    {
        path: 'history',
        loadComponent: () => import('./components/history/history').then(m => m.History)
    },
    {
        path: 'stats',
        loadComponent: () => import('./components/stats/stats').then(m => m.Stats)
    }
];
