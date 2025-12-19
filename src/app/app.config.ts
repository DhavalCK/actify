import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
// AngularFire (registers provider)
import { initializeFirestore, persistentLocalCache, provideFirestore } from '@angular/fire/firestore';
import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // initialize Firebase App
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // initialize FireAuth
    provideAuth(() => getAuth()),

    // initialize Firestore using the new localCache API
    provideFirestore(() => {
      const app = getApp(); // returns the firebase App created above

      try {

        // Use persistent IndexedDB-backed cache (recommended for offline)
        return initializeFirestore(app, {
          localCache: persistentLocalCache(),
        })
      } catch (err) {
        // If something goes wrong (older browsers, unavailable), fall back to default init
        console.warn('persistentLocalCache() failed — falling back to default Firestore init', err);

        // initializeFirestore without localCache will still work; or you can call getFirestore(app)
        return initializeFirestore(app, {});
      }
    }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
  ]
};
