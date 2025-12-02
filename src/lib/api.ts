const API_BASE_URL = import.meta.env.VITE_API_URL ?? 
  (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("adminToken");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = (data && (data.message as string)) || `Request failed with ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}

export { API_BASE_URL };


