import Constants from 'expo-constants';
import { persistToken, loadPersistedToken } from './auth-store';

let inMemoryToken: string | null = null;

function getBaseUrl(): string {
  const extra = (Constants.expoConfig as any)?.extra || (Constants as any)?.manifest2?.extra;
  const url = extra?.apiBaseUrl || 'http://127.0.0.1:8000/api/';
  return url.endsWith('/') ? url : `${url}/`;
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

export async function apiPostForm(path: string, data: Record<string, string>): Promise<any> {
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

export async function fetchSpaces(workspaceId: number | string) {
  return apiGet(`spaces?workspace_id=${workspaceId}`);
}

export async function createWorkspace(name: string) {
  return apiPostForm('workspaces', { name });
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
