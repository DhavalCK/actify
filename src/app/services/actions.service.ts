import { Injectable, signal, inject } from '@angular/core';
import { Action } from '../models/action.model';
import { addDoc, collection, collectionData, deleteDoc, doc, getDoc, Firestore, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { PerformanceService } from './performance.service';
import { StreakService } from './streak.service';

@Injectable({
  providedIn: 'root',
})
export class ActionsService {

  // TEMP: when auth added we'll replace this with current user's uid
  private readonly collectionPath = `actions`; // later users/${uid}/actions

  actions = signal<Action[]>([]);
  private db: Firestore;
  private auth: AuthService;
  private performance: PerformanceService;
  private streakServ: StreakService;

  constructor() {
    this.db = inject(Firestore); // inside constructor is safer
    this.auth = inject(AuthService); // inside constructor is safer
    this.performance = inject(PerformanceService);
    this.streakServ = inject(StreakService);

    this.auth.uid$.subscribe((uid) => {
      if (!uid) this.actions.set([]);

      // Get and Set Actions
      this.getAndSetActions()
    })
  }

  get userId() {
    return this.auth.currentUid;
  }

  get authCollectionPath() {
    return `users/${this.userId}/${this.collectionPath}`;
  }

  getAndSetActions() {
    if (!this.userId) return;
    // Created pointer to actions collection
    const colRef = collection(this.db, this.authCollectionPath);
    const q = query(colRef, orderBy('createdAt', 'desc'));

    collectionData(q, { idField: 'id' }).subscribe((docs: any[]) => {
      const formatted = docs.map((d) => ({
        id: d.id,
        title: d.title,
        done: !!d.done,
        createdAt: d.createdAt?.toMillis ? d.createdAt.toMillis() : (d.createdAt ?? Date.now())
      }) as Action);
      this.actions.set(formatted);
    })
  }

  get todayTasks(): Action[] {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
    const end = start + 24 * 60 * 60 * 1000 - 1;
    return this.actions().filter(a => (a.createdAt ?? 0) >= start && (a.createdAt ?? 0) <= end);
  }

  async calculatePerformance() {
    const total = this.todayTasks.length;
    const completed = this.todayTasks.reduce((acc, action) => acc + (action.done ? 1 : 0), 0);

    try {
      await this.performance.saveToday(completed, total);
      await this.streakServ.updateStreak(completed > 0);
    } catch (err) {
      console.error('calculatePerformance: save failed', err);
    }
  }

  // Add action 
  async add(title: string) {
    if (!this.userId) return;

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
    if (!this.userId) return;

    const docRef = doc(this.db, this.authCollectionPath, id);
    await deleteDoc(docRef);
    await this.calculatePerformance();
    return;
  }

  // Toggle Action
  async toggleDone(action: Action) {
    if (!this.userId) return;

    const docRef = doc(this.db, this.authCollectionPath, action.id);
    await updateDoc(docRef, {
      done: !action.done
    });
    await this.calculatePerformance();
    return;
  }
}
