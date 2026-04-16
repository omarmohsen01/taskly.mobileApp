import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { persistToken, loadPersistedToken } from './auth-store';

let inMemoryToken: string | null = null;

function getBaseUrl(): string {
  // If explicitly provided via our new .env file
  if (process.env.EXPO_PUBLIC_API_URL) {
    const url = process.env.EXPO_PUBLIC_API_URL;
    return url.endsWith('/') ? url : `${url}/`;
  }

  const extra = (Constants.expoConfig as any)?.extra || (Constants as any)?.manifest2?.extra;

  // Dynamic host injection for physical devices testing on the same Wi-Fi
  const hostUri = Constants?.expoConfig?.hostUri;
  if (Platform.OS !== 'web' && hostUri) {
    const ip = hostUri.split(':')[0]; // Extract the IP address (e.g., 192.168.1.100)
    return `http://${ip}:8000/api/`;
  }

  // Fallback for Web browser or PC-based Emulators mapped directly via proxy layer
  return 'http://127.0.0.1:8000/api/';
}

export function getToken(): string | null {
  return inMemoryToken;
}

/** Call once at app startup so getToken() returns the persisted value synchronously */
export async function hydrateToken(): Promise<void> {
  const stored = await loadPersistedToken();
  inMemoryToken = stored;
}

export async function setToken(token: string | null) {
  inMemoryToken = token;
  await persistToken(token);
}

export async function apiPostForm(path: string, data: Record<string, any>): Promise<any> {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    form.append(key, value);
  });
  const res = await fetch(getBaseUrl() + path.replace(/^\//, ''), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    } as any,
    body: form as any,
  });
  const text = await res.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const message = json?.message || json?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return json;
}

export async function apiGet(path: string): Promise<any> {
  const res = await fetch(getBaseUrl() + path.replace(/^\//, ''), {
    headers: {
      Accept: 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    } as any,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(json?.message || `Request failed (${res.status})`);
  }
  return json;
}

export async function signIn(email: string, password: string) {
  const resp = await apiPostForm('auth/signIn', { email, password });
  const token = resp?.token || resp?.data?.token || resp?.access_token || resp?.data?.access_token;
  if (token) await setToken(token);
  return resp;
}

export async function signUp(payload: {
  first_name: string;
  last_name: string;
  country_code: string;
  phone: string;
  email: string;
  password: string;
}) {
  const resp = await apiPostForm('auth/signUp', payload);
  const token = resp?.token || resp?.data?.token || resp?.access_token || resp?.data?.access_token;
  if (token) await setToken(token);
  return resp;
}

export async function fetchProfile() {
  return apiGet('auth/profile');
}

export async function fetchWorkspaces() {
  return apiGet('workspaces');
}

export async function fetchRoles() {
  return apiGet('roles');
}

export async function fetchSpaces(workspaceId: number | string) {
  return apiGet(`spaces?workspace_id=${workspaceId}`);
}

export async function createWorkspace(name: string) {
  return apiPostForm('workspaces', { name });
}

export async function createSpace(payload: {
  workspace_id: string | number;
  name: string;
  description: string;
  users?: number[];
}) {
  // Convert users array to users[0], users[1], etc. if needed by FormData
  // But usually apiPostForm can handle flat objects. 
  // If the backend expects users[0], users[1], we might need to adjust apiPostForm or the payload.
  // Looking at Postman: "key": "users[0]". 
  
  const data: Record<string, any> = {
    workspace_id: String(payload.workspace_id),
    name: payload.name,
    description: payload.description,
  };
  
  if (payload.users && payload.users.length > 0) {
    payload.users.forEach((id, index) => {
      data[`users[${index}]`] = String(id);
    });
  }

  return apiPostForm('spaces', data);
}

export async function createProject(payload: {
  space_id: string | number;
  name: string;
  description: string;
  status: string | number;
  start_date?: string;
  end_date?: string;
  access_mode: 'inherit' | 'restricted';
  users?: { user_id: number; role_id: number }[];
}) {
  const data: Record<string, any> = {
    space_id: String(payload.space_id),
    name: payload.name,
    description: payload.description,
    status: String(payload.status),
    access_mode: payload.access_mode,
  };
  
  if (payload.start_date) data.start_date = payload.start_date;
  if (payload.end_date) data.end_date = payload.end_date;

  if (payload.users && payload.users.length > 0) {
    payload.users.forEach((u, index) => {
      data[`users[${index}][user_id]`] = String(u.user_id);
      data[`users[${index}][role_id]`] = String(u.role_id);
    });
  }

  return apiPostForm('projects', data);
}

export async function createBoard(payload: {
  project_id: string | number;
  name: string;
  type: 'kanban' | 'list';
}) {
  const data: Record<string, any> = {
    project_id: String(payload.project_id),
    name: payload.name,
    type: payload.type,
  };
  return apiPostForm('boards', data);
}

export async function fetchProjects() {
  return apiGet('projects');
}

export async function fetchProjectUsers(projectId: string | number) {
  return apiGet(`projects/${projectId}/users`);
}

export async function fetchBoards() {
  return apiGet('boards');
}

export async function fetchLabels(projectId: string | number) {
  return apiGet(`labels?project_id=${projectId}`);
}

export async function createLabel(payload: {
  name: string;
  color: string;
  project_id: string | number;
}) {
  const data: Record<string, any> = {
    name: payload.name,
    color: payload.color,
    project_id: String(payload.project_id),
  };
  return apiPostForm('labels', data);
}

export async function createTask(payload: {
  title: string;
  descriptions?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  due_date?: string;
  board_id: number | string;
  board_column_id: number | string;
  assigned_users?: number[];
  labels_ids?: number[];
  attachments?: any[];
  parent_id?: number | string;
}) {
  const data: Record<string, any> = {
    title: payload.title,
    priority: payload.priority,
    position: '1',
    board_id: String(payload.board_id),
    board_column_id: String(payload.board_column_id),
  };
  if (payload.descriptions) data.descriptions = payload.descriptions;
  if (payload.start_date) data.start_date = payload.start_date;
  if (payload.due_date) data.due_date = payload.due_date;
  if (payload.parent_id) data.parent_id = String(payload.parent_id);
  
  if (payload.assigned_users && payload.assigned_users.length > 0) {
    payload.assigned_users.forEach((id, index) => {
      data[`assigned_users[${index}]`] = String(id);
    });
  }
  if (payload.labels_ids && payload.labels_ids.length > 0) {
    payload.labels_ids.forEach((id, index) => {
      data[`labels_ids[${index}]`] = String(id);
    });
  }
  if (payload.attachments && payload.attachments.length > 0) {
    payload.attachments.forEach((file, index) => {
      data[`attachments[${index}]`] = file;
    });
  }

  return apiPostForm('tasks', data);
}

export async function fetchTasks(boardId: string | number) {
  return apiGet(`tasks?board_id=${boardId}`);
}

export async function fetchTaskDetails(taskId: string | number) {
  return apiGet(`tasks/${taskId}`);
}

export async function updateTask(taskId: string | number, payload: {
  title?: string;
  descriptions?: string;
  priority?: string;
  start_date?: string;
  due_date?: string;
  board_column_id?: number | string;
  assigned_users?: number[];
  labels_ids?: number[];
}) {
  const data: Record<string, any> = {};
  if (payload.title) data.title = payload.title;
  if (payload.descriptions !== undefined) data.descriptions = payload.descriptions;
  if (payload.priority) data.priority = payload.priority;
  if (payload.start_date) data.start_date = payload.start_date;
  if (payload.due_date) data.due_date = payload.due_date;
  if (payload.board_column_id) data.board_column_id = String(payload.board_column_id);
  
  if (payload.assigned_users && payload.assigned_users.length > 0) {
    payload.assigned_users.forEach((id, index) => {
      data[`assigned_users[${index}]`] = String(id);
    });
  }
  if (payload.labels_ids && payload.labels_ids.length > 0) {
    payload.labels_ids.forEach((id, index) => {
      data[`labels_ids[${index}]`] = String(id);
    });
  }

  // Laravel handles PATCH/PUT methods via _method field in FormData if using POST
  data._method = 'PATCH';

  return apiPostForm(`tasks/${taskId}`, data);
}

export async function createComment(payload: {
  task_id: string | number;
  comments: string;
}) {
  return apiPostForm('comments', payload);
}

export type StatFilter = 'all' | 'today' | 'completed' | 'in_progress';

export async function fetchStatistics(workspaceId: number | string, filter: StatFilter = 'all') {
  return apiGet(`home/statistics?workspace_id=${workspaceId}&filter=${filter}`);
}

export async function signOut() {
  const token = getToken();
  
  // Clear the local token instantly for a responsive UI
  await setToken(null);
  
  // Call the signout endpoint in the background with the captured token
  if (token) {
    fetch(getBaseUrl() + 'auth/signout', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).catch(e => console.error('Background signout error:', e));
  }
}
