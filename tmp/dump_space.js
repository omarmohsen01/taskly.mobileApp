
const fs = require('fs');
const BASE_URL = 'http://127.0.0.1:8000/api/';

async function dumpSpace() {
    try {
        const loginForm = new URLSearchParams();
        loginForm.append('email', 'jane.smith@example.com');
        loginForm.append('password', 'password');
        const loginRes = await fetch(BASE_URL + 'auth/signIn', { method: 'POST', body: loginForm });
        const loginData = await loginRes.json();
        const token = loginData?.token || loginData?.data?.token;

        const wsRes = await fetch(BASE_URL + 'workspaces', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const wsData = await wsRes.json();
        const workspaceId = wsData.data[0].id;

        const spacesRes = await fetch(BASE_URL + `spaces?workspace_id=${workspaceId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const spacesData = await spacesRes.json();
        fs.writeFileSync('d:/Freelance/Team.WorkSpace/mobile-app/tmp/space_dump.json', JSON.stringify(spacesData.data[0], null, 2));
        console.log('Dumped space to tmp/space_dump.json');
    } catch (e) { console.error(e); }
}

dumpSpace();
