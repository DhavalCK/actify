import { Injectable, signal, inject, effect } from '@angular/core';
import { Firestore, collection, query, where, orderBy, limit, getDocs, startAfter, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Action } from '../models/action.model';

@Injectable({
    providedIn: 'root'
})
export class HistoryService {
    private readonly PAGE_SIZE = 20;
    private lastDoc: QueryDocumentSnapshot | null = null;

    historyActions = signal<Action[]>([]);
    isLoading = signal<boolean>(false);
    hasMore = signal<boolean>(true);

    private db = inject(Firestore);
    private auth = inject(AuthService);

    constructor() {
        effect(() => {
            if (this.auth.userId) {
                this.loadInitialHistory();
            } else {
                this.historyActions.set([]);
                this.resetPagination();
            }
        });
    }

    private get collectionPath() {
        return `users/${this.auth.userId}/actions`;
    }

    private resetPagination() {
        this.lastDoc = null;
        this.hasMore.set(true);
        this.isLoading.set(false);
    }

    async loadInitialHistory() {
        if (!this.auth.userId) return;

        this.resetPagination();
        this.isLoading.set(true);

        try {
            const colRef = collection(this.db, this.collectionPath);
            const q = query(
                colRef,
                where('done', '==', true),
                orderBy('doneAt', 'desc'),
                limit(this.PAGE_SIZE)
            );

            const snapshot = await getDocs(q);
            const actions = this.mapDocs(snapshot.docs);

            this.historyActions.set(actions);
            this.updatePaginationState(snapshot.docs);
        } catch (err) {
            console.error('Error loading history:', err);
        } finally {
            this.isLoading.set(false);
        }
    }

    async loadMoreHistoryActions() {
        if (!this.auth.userId || !this.hasMore() || this.isLoading()) return;

        this.isLoading.set(true);

        try {
            const colRef = collection(this.db, this.collectionPath);
            const q = query(
                colRef,
                where('done', '==', true),
                orderBy('doneAt', 'desc'),
                startAfter(this.lastDoc),
                limit(this.PAGE_SIZE)
            );

            const snapshot = await getDocs(q);
            const newActions = this.mapDocs(snapshot.docs);

            this.historyActions.update(current => [...current, ...newActions]);
            this.updatePaginationState(snapshot.docs);
        } catch (err) {
            console.error('Error loading more history:', err);
        } finally {
            this.isLoading.set(false);
        }
    }

    private mapDocs(docs: QueryDocumentSnapshot[]): Action[] {
        return docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                title: data['title'],
                done: !!data['done'],
                createdAt: data['createdAt']?.toMillis ? data['createdAt'].toMillis() : (data['createdAt'] ?? 0),
                doneAt: data['doneAt']?.toMillis ? data['doneAt'].toMillis() : (data['doneAt'] ?? 0)
            } as Action;
        });
    }

    private updatePaginationState(docs: QueryDocumentSnapshot[]) {
        if (docs.length > 0) {
            this.lastDoc = docs[docs.length - 1];
            this.hasMore.set(docs.length === this.PAGE_SIZE);
        } else {
            this.hasMore.set(false);
        }
    }
}
