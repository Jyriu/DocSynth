// Simple API helper for the frontend to communicate with the Express backend
// Uses the Fetch API; adjust BASE_URL in .env (REACT_APP_API_URL) if needed.

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
}

export async function register(name, email, password) {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return handleResponse(res);
}

export async function summarisePdf(file, token) {
  const formData = new FormData();
  formData.append('file', file);

  // Créer un AbortController pour gérer le timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

  try {
    const res = await fetch(`${BASE_URL}/summaries/generate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return handleResponse(res);
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Le traitement prend trop de temps. Essayez avec un document plus petit.');
    }
    
    throw error;
  }
}
