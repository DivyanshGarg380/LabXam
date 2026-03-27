// Central API configuration
// Replace this URL with your production URL when deploying
export const API_BASE = import.meta.env.VITE_API_URL;

// Token helpers
export const getToken = (): string | null => localStorage.getItem("admin_token");
export const setToken = (token: string)   => localStorage.setItem("admin_token", token);
export const clearToken = ()              => localStorage.removeItem("admin_token");

// Authenticated fetch wrapper
export const apiFetch = async (
  path: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
};