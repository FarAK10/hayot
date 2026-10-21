import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  useEmulators: true,
  firebase: {
    projectId: 'demo-payme',
    apiKey: 'demo-key',
    authDomain: 'demo-payme.firebaseapp.com',
    appId: 'demo-app',
  },
};
