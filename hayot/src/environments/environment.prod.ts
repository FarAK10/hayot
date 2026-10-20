import { Environment } from './environment.model';

// Replace the placeholders with your Firebase web app config (see README: "Deploying your own").
export const environment: Environment = {
  production: true,
  useEmulators: false,
  transactionBackend: 'firebase',
  firebase: {
    projectId: 'YOUR_PROJECT_ID',
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    appId: 'YOUR_APP_ID',
  },
};
