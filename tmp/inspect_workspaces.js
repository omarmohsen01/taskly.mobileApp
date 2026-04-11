
const BASE_URL = 'http://127.0.0.1:8000/api/';

async function inspectWorkspaces() {
    try {
        const loginForm = new URLSearchParams();
        loginForm.append('email', 'jane.smith@example.com');
        loginForm.append('password', 'password');
        const loginRes = await fetch(BASE_URL + 'auth/signIn', { method: 'POST', body: loginForm });
        const loginData = await loginRes.json();
        const token = loginData?.token || loginData?.data?.token;

        const res = await fetch(BASE_URL + 'workspaces', {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const data = await res.json();
        console.log('Workspaces index response data:', JSON.stringify(data.data[0], (k, v) => (k === 'projects' || k === 'boards' ? undefined : v), 2));
    } catch (e) { console.error(e); }
}

inspectWorkspaces();
