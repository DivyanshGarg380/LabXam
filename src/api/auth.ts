import { apiFetch, setToken, clearToken } from "./config";
import { toast } from "sonner";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "superadmin";
};

export const login = async (
  email: string,
  password: string
): Promise<AdminUser | null> => {
  try {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? "Invalid credentials");
      return null;
    }

    const data = await res.json();
    setToken(data.token);
    return { id: data.id, name: data.name, email, role: data.role };
  } catch {
    toast.error("Login failed. Is the server running?");
    return null;
  }
};

export const logout = () => {
  clearToken();
};

export const getMe = async (): Promise<AdminUser | null> => {
  try {
    const res = await apiFetch("/auth/me");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  try {
    const res = await apiFetch("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? "Password change failed");
      return false;
    }
    toast.success("Password changed successfully");
    return true;
  } catch {
    toast.error("Request failed");
    return false;
  }
};