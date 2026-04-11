
const BASE_URL = 'http://127.0.0.1:8000/api/';

async function inspectSpaceShow() {
    try {
        const loginForm = new URLSearchParams();
        loginForm.append('email', 'jane.smith@example.com');
        loginForm.append('password', 'password');
        const loginRes = await fetch(BASE_URL + 'auth/signIn', { method: 'POST', body: loginForm });
        const loginData = await loginRes.json();
        const token = loginData?.token || loginData?.data?.token;

        const res = await fetch(BASE_URL + 'spaces/1', {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const data = await res.json();
        console.log('Space Show Response Keys:', Object.keys(data.data || data));
        if (data.data?.users) console.log('Show success - users count:', data.data.users.length);
    } catch (e) { console.error(e); }
}

inspectSpaceShow();
