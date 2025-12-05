import { Injectable, WritableSignal, signal } from '@angular/core';
import { Action } from '../models/action.model';

@Injectable({
  providedIn: 'root',
})
export class ActionsService {

  actions = signal<Action[]>([]);

  add(title: string) {
    this.actions.update((actions) =>
      [
        ...actions,
        {
          id: Date.now().toString(),
          title: title,
          done: false,
          createdAt: Date.now()
        }
      ]
    )
  }

  remove(id: string) {
    this.actions.update((actions) => actions.filter((action) => action.id !== id))
  }

  toggleDone(id: string) {
    this.actions.update((actions) => {
      const action = actions.find((action) => action.id === id);
      if (action) action.done = !action.done;
      return actions;
    })
  }
}
