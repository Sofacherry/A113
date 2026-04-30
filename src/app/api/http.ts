export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
}

export class ApiError extends Error {
  status: number;
  problem?: ProblemDetails;

  constructor(message: string, status: number, problem?: ProblemDetails) {
    super(message);
    this.status = status;
    this.problem = problem;
  }
}

const BASE_URL = "";

function buildHeaders(token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function apiRequest<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...buildHeaders(token),
      ...(init?.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const isProblem = contentType.includes("application/problem+json");

  if (!response.ok) {
    if (isProblem) {
      const problem = (await response.json()) as ProblemDetails;
      throw new ApiError(problem.detail || "Ошибка запроса", response.status, problem);
    }
    const text = await response.text();
    throw new ApiError(text || "Ошибка запроса", response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }
  return (await response.json()) as T;
}
