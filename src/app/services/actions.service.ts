import { Injectable, signal, inject, effect } from '@angular/core';
import { Action } from '../models/action.model';
import { addDoc, collection, collectionData, deleteDoc, doc, getDoc, Firestore, orderBy, query, updateDoc, where, getDocs, limit } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { PerformanceService } from './performance.service';
import { StreakService } from './streak.service';

@Injectable({
  providedIn: 'root',
})
export class ActionsService {

  // TEMP: when auth added we'll replace this with current user's uid
  private readonly collectionPath = `actions`; // later users/${uid}/actions
  private readonly PAGE_SIZE = 50;

  actions = signal<Action[]>([]);
  isLoading = signal<boolean>(false);
  hasMore = signal<boolean>(true);

  private db: Firestore;
  private auth: AuthService;
  private performance: PerformanceService;
  private streakServ: StreakService;

  constructor() {
    this.db = inject(Firestore); // inside constructor is safer
    this.auth = inject(AuthService); // inside constructor is safer
    this.performance = inject(PerformanceService);
    this.streakServ = inject(StreakService);

    effect(() => {
      if (!this.auth.userId) {
        this.actions.set([]);
        this.resetPagination();
      } else {
        this.getAndSetActions();
      }
    })
  }

  get authCollectionPath() {
    return `users/${this.auth.userId}/${this.collectionPath}`;
  }

  private resetPagination() {
    this.hasMore.set(true);
    this.isLoading.set(false);
  }

  getAndSetActions() {
    if (!this.auth.userId) return;

    this.resetPagination();

    // Use real-time subscription with limit for recent actions
    const colRef = collection(this.db, this.authCollectionPath);
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(this.PAGE_SIZE));

    collectionData(q, { idField: 'id' }).subscribe((docs: any[]) => {
      const formatted = docs.map((d) => ({
        id: d.id,
        title: d.title,
        done: !!d.done,
        createdAt: d.createdAt?.toMillis ? d.createdAt.toMillis() : (d.createdAt ?? Date.now()),
        doneAt: d.doneAt?.toMillis ? d.doneAt.toMillis() : d.doneAt
      }) as Action);

      // If we have older actions loaded, preserve them
      const currentActions = this.actions();
      if (currentActions.length > this.PAGE_SIZE) {
        // Merge: keep real-time updates for first PAGE_SIZE, preserve older loaded actions
        const olderActions = currentActions.slice(this.PAGE_SIZE);
        this.actions.set([...formatted, ...olderActions]);
      } else {
        this.actions.set(formatted);
        this.hasMore.set(docs.length === this.PAGE_SIZE);
      }
    });
  }

  async loadMoreActions() {
    if (!this.auth.userId || !this.hasMore() || this.isLoading()) return;

    const currentActions = this.actions();
    if (currentActions.length === 0) return;

    this.isLoading.set(true);

    try {
      const colRef = collection(this.db, this.authCollectionPath);

      // Get the oldest action's timestamp from current list
      const oldestAction = currentActions[currentActions.length - 1];
      const oldestTimestamp = oldestAction.createdAt;

      // Query for actions older than the oldest one we have
      const q = query(
        colRef,
        orderBy('createdAt', 'desc'),
        where('createdAt', '<', oldestTimestamp),
        limit(this.PAGE_SIZE)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        this.hasMore.set(false);
        return;
      }

      const formatted = snapshot.docs.map((d) => ({
        id: d.id,
        title: d.data()['title'],
        done: !!d.data()['done'],
        createdAt: d.data()['createdAt']?.toMillis ? d.data()['createdAt'].toMillis() : (d.data()['createdAt'] ?? Date.now()),
        doneAt: d.data()['doneAt']?.toMillis ? d.data()['doneAt'].toMillis() : d.data()['doneAt']
      }) as Action);

      // Append to existing actions
      this.actions.update(current => [...current, ...formatted]);
      this.hasMore.set(snapshot.docs.length === this.PAGE_SIZE);
    } catch (err) {
      console.error('loadMoreActions failed', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async computeTodayCountsFromFirestore() {
    if (!this.auth.userId) return { completed: 0, total: 0 };
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
    const end = start + 24 * 60 * 60 * 1000 - 1;

    const colRef = collection(this.db, this.authCollectionPath);
    // query documents with createdAt in today's range
    const q = query(colRef, where('createdAt', '>=', start), where('createdAt', '<=', end));
    try {
      const snap = await getDocs(q);
      let total = 0;
      let completed = 0;

      snap.forEach(d => {
        total++;
        const data: any = d.data();
        if (data.done) completed++;
      });
      return { completed, total };
    } catch (err) {
      console.error('computeTodayCountsFromFirestore failed', err);
      return { completed: 0, total: 0 };
    }
  }

  async calculatePerformance() {
    const { completed, total } = await this.computeTodayCountsFromFirestore();


    try {
      await this.performance.saveToday(completed, total);
      await this.streakServ.updateStreak(completed > 0);
    } catch (err) {
      console.error('calculatePerformance: save failed', err);
    }
  }

  // Add action 
  async add(title: string) {
    if (!this.auth.userId) return;

    const colRef = collection(this.db, this.authCollectionPath);
    const docRef = await addDoc(colRef, {
      title: title.trim(),
      done: false,
      createdAt: Date.now()
    });
    await this.calculatePerformance();
    return docRef.id;
  }

  // Remove Action
  async remove(id: string) {
    if (!this.auth.userId) return;

    const docRef = doc(this.db, this.authCollectionPath, id);
    await deleteDoc(docRef);
    await this.calculatePerformance();
    return;
  }

  // Toggle Action
  async toggleDone(action: Action) {
    if (!this.auth.userId) return;

    const newDoneState = !action.done;
    const docRef = doc(this.db, this.authCollectionPath, action.id);

    await updateDoc(docRef, {
      done: newDoneState,
      doneAt: newDoneState ? Date.now() : null
    });
    await this.calculatePerformance();
    return;
  }

  get todayStartDate(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }
}
