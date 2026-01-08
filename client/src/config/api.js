// API Configuration
// Default to production URL to ensure live deployments work out of the box.
let API_URL = 'https://client-reporting.onrender.com/api';

// Only use localhost if explicitly running on localhost
// Only use localhost if explicitly running on localhost
// const hostname = window.location.hostname;
// if (hostname === 'localhost' || hostname === '127.0.0.1') {
//     API_URL = 'http://127.0.0.1:5002/api';
// }

// Allow environment variable override, BUT IGNORE LOCALHOST in production
if (import.meta.env.VITE_API_URL) {
    const envUrl = import.meta.env.VITE_API_URL;
    // If the env var is localhost, but we are not running locally, ignore it.
    // This protects against accidental Vercel env vars point to localhost
    if (!envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        API_URL = envUrl;
    }
}

export default API_URL;
