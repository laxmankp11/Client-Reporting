import axios from 'axios';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = '123456';
const BASE_URL = 'http://127.0.0.1:5002/api';

const runTest = async () => {
    try {
        console.log(`1. Attempting Login to ${BASE_URL}/auth/login...`);
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });

        const token = loginRes.data.token;
        console.log('Login Successful! Token received.', token.substring(0, 10) + '...');

        console.log('\n2. Fetching Users...');
        const usersRes = await axios.get(`${BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Success! Found ${usersRes.data.length} users.`);
        console.log('Sample User:', usersRes.data[0]);

    } catch (error) {
        console.error('Global Error Code:', error.code);
        console.error('Global Error Message:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
};

runTest();
