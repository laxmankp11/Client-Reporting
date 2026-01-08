// API Configuration
// Default to production URL to ensure live deployments work out of the box.
let API_URL = 'https://client-reporting.onrender.com/api';

// Only use localhost if explicitly running on localhost
// Only use localhost if explicitly running on localhost
// const hostname = window.location.hostname;
// if (hostname === 'localhost' || hostname === '127.0.0.1') {
//     API_URL = 'http://127.0.0.1:5002/api';
// }

// Allow environment variable override (if it exists and is not empty)
if (import.meta.env.VITE_API_URL) {
    API_URL = import.meta.env.VITE_API_URL;
}

export default API_URL;
