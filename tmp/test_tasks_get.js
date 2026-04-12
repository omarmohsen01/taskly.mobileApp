
const BASE_URL = 'http://127.0.0.1:8000/api/';

async function testFetchTasks() {
    try {
        const loginForm = new URLSearchParams();
        loginForm.append('email', 'jane.smith@example.com');
        loginForm.append('password', 'password');
        const loginRes = await fetch(BASE_URL + 'auth/signIn', { method: 'POST', body: loginForm });
        const loginData = await loginRes.json();
        const token = loginData?.token || loginData?.data?.token;

        // Fetch tasks for board_id = 1 (assuming 1 exists based on previous scripts)
        const res = await fetch(BASE_URL + 'tasks?board_id=1', {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Tasks GET Output:', JSON.stringify(await res.json(), null, 2));
    } catch (e) { console.error(e); }
}

testFetchTasks();
