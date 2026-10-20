import { Environment } from './environment.model';

// Firebase web config (public by design; access is enforced by firestore.rules).
export const environment: Environment = {
  production: true,
  useEmulators: false,
  transactionBackend: 'firebase',
  firebase: {
    projectId: 'hayot-11a29',
    apiKey: 'AIzaSyAs7V7g5BJIZTweaUJMpMATGhE7QMcHVHI',
    authDomain: 'hayot-11a29.firebaseapp.com',
    appId: '1:1073416579958:web:7acd82e07a1f17b278e857',
  },
};
