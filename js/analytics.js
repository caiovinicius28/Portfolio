/**
 * Vercel Web Analytics
 * Initializes Vercel Web Analytics for tracking page views and events
 */

import { inject } from '../node_modules/@vercel/analytics/dist/index.mjs';

// Initialize Vercel Analytics
inject({
  mode: 'auto',
  debug: false
});
