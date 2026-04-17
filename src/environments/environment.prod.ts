export const environment = {
  production: true,
  apiUrl: '/api',
  wsUrl: '/ws',
  appVersion: '1.0.0',
  githubOAuth: {
    clientId: '',
    redirectUri: '/auth/callback',
    scope: 'read:user user:email',
  },
};
