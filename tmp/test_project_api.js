
const BASE_URL = 'http://127.0.0.1:8000/api/';

async function testCreateProject() {
    console.log('--- Starting API Test for Create Project ---');
    try {
        // 1. Sign In
        const loginForm = new URLSearchParams();
        loginForm.append('email', 'jane.smith@example.com');
        loginForm.append('password', 'password');

        const loginRes = await fetch(BASE_URL + 'auth/signIn', {
            method: 'POST',
            body: loginForm,
            headers: { 'Accept': 'application/json' }
        });
        const loginData = await loginRes.json();
        const token = loginData?.token || loginData?.data?.token;

        if (!token) throw new Error('Failed to get token');

        // 2. Get Workspaces
        const wsRes = await fetch(BASE_URL + 'workspaces', {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        const wsData = await wsRes.json();
        const workspaceId = wsData.data[0].id;

        // 3. Get Spaces
        const spacesRes = await fetch(BASE_URL + `spaces?workspace_id=${workspaceId}`, {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        const spacesData = await spacesRes.json();
        const space = spacesData.data[0];
        if (!space) throw new Error('No space found to create project in');

        console.log(`Using Space: ${space.name} (ID: ${space.id})`);

        // 4. Create Project
        const projectForm = new URLSearchParams();
        projectForm.append('space_id', space.id);
        projectForm.append('name', 'API Test Project ' + Date.now());
        projectForm.append('description', 'Test project description');
        projectForm.append('status', '1');
        projectForm.append('access_mode', 'inherit');
        projectForm.append('start_date', '2026-05-01');
        projectForm.append('end_date', '2026-06-01');
        
        // Add a user if any
        if (space.users && space.users.length > 0) {
            projectForm.append('users[0]', space.users[0].id);
        }

        const createRes = await fetch(BASE_URL + 'projects', {
            method: 'POST',
            body: projectForm,
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        const createData = await createRes.json();
        console.log('Project creation response:', createData.message || createData);

        if (createRes.ok) {
            console.log('--- TEST SUCCESSFUL ---');
        } else {
            console.log('--- TEST FAILED ---');
        }

    } catch (e) {
        console.error('--- TEST ERROR ---', e.message);
    }
}

testCreateProject();
