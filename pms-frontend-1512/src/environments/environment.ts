export const environment = {
  production: false,
  // Temporarily using direct connection to test if proxy is the issue
  // If this works, we'll switch back to proxy: '/api/v0'
  apiUrl: 'http://localhost:3005/api/v0',
  frontendUrl: 'http://localhost:4200'
};
