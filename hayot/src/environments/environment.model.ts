export interface Environment {
  production: boolean;
  /** Run against the local Firebase Emulator Suite (`npm run emulators`, needs Java 11+). */
  useEmulators: boolean;
  /** 'firebase' | 'local' (localStorage, no backend needed). */
  transactionBackend: 'firebase' | 'local';
  firebase: {
    projectId: string;
    apiKey: string;
    authDomain: string;
    appId: string;
  };
}
