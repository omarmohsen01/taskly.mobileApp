
const BASE_URL = 'http://127.0.0.1:8000/api/';

async function inspectSpaces() {
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
        const space = spacesData.data[0];
        console.log('Keys in Space object:', Object.keys(space));
        if (space.users) console.log('Space has users array, count:', space.users.length);
        if (space.members) console.log('Space has members array, count:', space.members.length);
    } catch (e) { console.error(e); }
}

inspectSpaces();
