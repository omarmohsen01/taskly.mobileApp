
const BASE_URL = 'http://127.0.0.1:8000/api/';

async function testInclude() {
    try {
        const loginForm = new URLSearchParams();
        loginForm.append('email', 'jane.smith@example.com');
        loginForm.append('password', 'password');
        const loginRes = await fetch(BASE_URL + 'auth/signIn', { method: 'POST', body: loginForm });
        const loginData = await loginRes.json();
        const token = loginData?.token || loginData?.data?.token;

        const res = await fetch(BASE_URL + 'spaces?workspace_id=1&include=users', {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const data = await res.json();
        console.log('Keys with include=users:', Object.keys(data.data[0]));
        if (data.data[0].users) console.log('Users found!');
    } catch (e) { console.error(e); }
}

testInclude();
