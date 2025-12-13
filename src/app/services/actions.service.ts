import { Injectable, signal, inject, effect } from '@angular/core';
import { Action } from '../models/action.model';
import { addDoc, collection, collectionData, deleteDoc, doc, getDoc, Firestore, orderBy, query, updateDoc, where, getDocs } from '@angular/fire/firestore';
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

    effect(() => {
      if (!this.auth.userId) this.actions.set([]);

      this.getAndSetActions();
    })
  }

  get authCollectionPath() {
    return `users/${this.auth.userId}/${this.collectionPath}`;
  }

  getAndSetActions() {
    if (!this.auth.userId) return;
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
      await this.streakServ.updateStreak(true);
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

    const docRef = doc(this.db, this.authCollectionPath, action.id);
    await updateDoc(docRef, {
      done: !action.done
    });
    await this.calculatePerformance();
    return;
  }
}
