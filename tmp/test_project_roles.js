
const BASE_URL = 'http://127.0.0.1:8000/api/';

async function testProjectWithRoles() {
    try {
        const loginForm = new URLSearchParams();
        loginForm.append('email', 'jane.smith@example.com');
        loginForm.append('password', 'password');
        const loginRes = await fetch(BASE_URL + 'auth/signIn', { method: 'POST', body: loginForm });
        const loginData = await loginRes.json();
        const token = loginData?.token || loginData?.data?.token;

        // Create Project Payload matching the frontend logic
        const projectForm = new URLSearchParams();
        projectForm.append('space_id', '1');
        projectForm.append('name', 'Role Test Project ' + Date.now());
        projectForm.append('description', 'Testing role assignment');
        projectForm.append('status', '1');
        projectForm.append('access_mode', 'restricted');
        
        // Mocking the behavior where index[user_id] and index[role_id] are used
        projectForm.append('users[0][user_id]', '1');
        projectForm.append('users[0][role_id]', '1');
        
        projectForm.append('users[1][user_id]', '2');
        projectForm.append('users[1][role_id]', '2');

        const createRes = await fetch(BASE_URL + 'projects', {
            method: 'POST',
            body: projectForm,
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        
        const createData = await createRes.json();
        console.log('Project Creation Output:', createData);
    } catch (e) { console.error(e); }
}

testProjectWithRoles();
