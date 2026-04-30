import { apiRequest } from "./http";

export type BackendRole = "Client" | "Manager" | "Admin";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: BackendRole;
}

export interface AuthPayload {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterRequest {
  displayName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export function loginRequest(payload: LoginRequest) {
  return apiRequest<AuthPayload>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerRequest(payload: RegisterRequest) {
  return apiRequest<AuthPayload>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function meRequest(token: string) {
  return apiRequest<AuthUser>("/api/auth/me", { method: "GET" }, token);
}
