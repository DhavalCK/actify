import { Injectable, signal } from "@angular/core";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    // holds current uid (null until signed)
    uidSignal = signal<string | null>(null);

    constructor() {
        const auth = getAuth();

        // listen for auth state changes
        onAuthStateChanged(auth, user => {
            if (user) {
                this.uidSignal.set(user.uid);
            } else {
                // if no user, request anonymous sign-in
                signInAnonymously(auth).catch(err => {
                    console.error('Anonymous sign-in failed', err);
                });
            }
        })
    }

    get userId() {
        return this.uidSignal();
    }
}