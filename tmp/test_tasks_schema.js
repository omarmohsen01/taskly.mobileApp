
const fs = require('fs');
const BASE_URL = 'http://127.0.0.1:8000/api/';

async function testFetchTasks() {
    try {
        const loginForm = new URLSearchParams();
        loginForm.append('email', 'jane.smith@example.com');
        loginForm.append('password', 'password');
        const loginRes = await fetch(BASE_URL + 'auth/signIn', { method: 'POST', body: loginForm });
        const loginData = await loginRes.json();
        const token = loginData?.token || loginData?.data?.token;

        const res = await fetch(BASE_URL + 'tasks?board_id=1', {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        
        fs.writeFileSync('tmp/tasks_out.json', JSON.stringify(await res.json(), null, 2));
        console.log('Saved to tmp/tasks_out.json');
    } catch (e) { console.error(e); }
}

testFetchTasks();
