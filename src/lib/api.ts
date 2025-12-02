const API_BASE_URL = import.meta.env.VITE_API_URL ?? 
  (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("adminToken");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include', // Include credentials for CORS
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = (data && (data.message as string)) || `Request failed with ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}

export { API_BASE_URL };


