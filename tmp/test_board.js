
const BASE_URL = 'http://127.0.0.1:8000/api/';

async function testBoardAPI() {
    try {
        const loginForm = new URLSearchParams();
        loginForm.append('email', 'jane.smith@example.com');
        loginForm.append('password', 'password');
        const loginRes = await fetch(BASE_URL + 'auth/signIn', { method: 'POST', body: loginForm });
        const loginData = await loginRes.json();
        const token = loginData?.token || loginData?.data?.token;

        // Try KanBan and List
        const boardForm = new URLSearchParams();
        boardForm.append('project_id', '1');
        boardForm.append('name', 'API Sync Kanban ' + Date.now());
        boardForm.append('type', 'kanban');

        const createRes = await fetch(BASE_URL + 'boards', {
            method: 'POST',
            body: boardForm,
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Board Creation Output:', await createRes.json());
    } catch (e) { console.error(e); }
}

testBoardAPI();
