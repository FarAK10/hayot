import { Environment } from './environment.model';

// Copy to environment.prod.ts and fill in the values from the Firebase console
// (Project settings -> Your apps -> Web app -> SDK setup and configuration).
export const environment: Environment = {
  production: true,
  useEmulators: false,
  transactionBackend: 'firebase',
  firebase: {
    projectId: '<project-id>',
    apiKey: '<web-api-key>',
    authDomain: '<project-id>.firebaseapp.com',
    appId: '<web-app-id>',
  },
};
