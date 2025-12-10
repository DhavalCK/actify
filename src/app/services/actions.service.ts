import { Injectable, signal, inject } from '@angular/core';
import { Action } from '../models/action.model';
import { addDoc, collection, collectionData, deleteDoc, doc, getDoc, Firestore, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ActionsService {

  // TEMP: when auth added we'll replace this with current user's uid
  private readonly collectionPath = `actions`; // later users/${uid}/actions

  actions = signal<Action[]>([]);
  private db: Firestore;
  private auth: AuthService

  constructor() {
    this.db = inject(Firestore); // inside constructor is safer
    this.auth = inject(AuthService); // inside constructor is safer


    this.auth.uid$.subscribe((uid) => {
      if (!uid) this.actions.set([]);

      // Get and Set Actions
      this.getAndSetActions()
    })
  }

  get userId() {
    return this.auth.uid$.value;
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

  // Add action 
  async add(title: string) {
    if (!this.userId) return;

    const colRef = collection(this.db, this.authCollectionPath);
    const docRef = await addDoc(colRef, {
      title: title.trim(),
      done: false,
      createdAt: Date.now()
    });
    return docRef.id;
  }

  // Remove Action
  async remove(id: string) {
    if (!this.userId) return;

    const docRef = doc(this.db, this.authCollectionPath, id);
    await deleteDoc(docRef);
    return;
  }

  // Toggle Action
  async toggleDone(action: Action) {
    if (!this.userId) return;

    const docRef = doc(this.db, this.authCollectionPath, action.id);
    await updateDoc(docRef, {
      done: !action.done
    });
    return;
  }
}
