import { Environment } from './environment.model';

export const environment: Environment = {
  production: true,
  useEmulators: false,
  firebase: {
    projectId: '<project-id>',
    apiKey: '<web-api-key>',
    authDomain: '<project-id>.firebaseapp.com',
    appId: '<web-app-id>',
  },
};
