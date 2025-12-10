import { Injectable, signal, inject } from '@angular/core';
import { Action } from '../models/action.model';
import { addDoc, collection, collectionData, deleteDoc, doc, getDoc, Firestore, orderBy, query, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ActionsService {

  // TEMP: when auth added we'll replace this with current user's uid
  private readonly collectionPath = `actions`; // later users/${uid}/actions

  actions = signal<Action[]>([]);
  private db: Firestore;

  constructor() {
    this.db = inject(Firestore); // inside constructor is safer
    // Created pointer to actions collection
    const colRef = collection(this.db, this.collectionPath);
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
    const colRef = collection(this.db, this.collectionPath);
    const docRef = await addDoc(colRef, {
      title: title.trim(),
      done: false,
      createdAt: Date.now()
    });
    return docRef.id;
  }

  // Remove Action
  async remove(id: string) {
    const docRef = doc(this.db, this.collectionPath, id);
    await deleteDoc(docRef);
    return;
  }

  // Toggle Action
  async toggleDone(action: Action) {
    const docRef = doc(this.db, this.collectionPath, action.id);
    await updateDoc(docRef, {
      done: !action.done
    });
    return;
  }
}
