export interface Environment {
  production: boolean;
  useEmulators: boolean;
  firebase: {
    projectId: string;
    apiKey: string;
    authDomain: string;
    appId: string;
  };
}
