import { Injectable } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    // holds current uid (null until signed)
    uid$ = new BehaviorSubject<string | null>(null);
    uid = toSignal(this.uid$, { initialValue: null });

    constructor() {
        const auth = getAuth();

        // listen for auth state changes
        onAuthStateChanged(auth, user => {
            if (user) {
                this.uid$.next(user.uid);
            } else {
                // if no user, request anonymous sign-in
                signInAnonymously(auth).catch(err => {
                    console.error('Anonymous sign-in failed', err);
                });
            }
        })
    }
}