/**
 * API Client
 * ==========
 * Centralized fetch wrapper for all API calls to the FastAPI backend.
 * Handles authentication tokens, CSRF, and error responses.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Get CSRF token from cookie for state-changing requests.
 */
function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Generic API fetch wrapper with automatic auth and CSRF handling.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {};
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  // Add CSRF token for state-changing requests
  if (options.method && ["POST", "PUT", "DELETE", "PATCH"].includes(options.method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Include cookies for JWT
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let msg = "حدث خطأ في الاتصال بالخادم";
    if (typeof errorData.detail === "string") {
      msg = errorData.detail;
    } else if (Array.isArray(errorData.detail)) {
      msg = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(", ");
    } else if (errorData.detail && typeof errorData.detail === "object") {
      msg = JSON.stringify(errorData.detail);
    }
    throw new ApiError(
      msg,
      response.status,
      errorData
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Custom API Error class.
 */
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/* ─── API Methods ──────────────────────────────────────────── */

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => apiFetch("/api/auth/logout", { method: "POST" }),
  me: () => apiFetch("/api/auth/me"),
};

// Categories
export const categoriesApi = {
  getAll: () => apiFetch<Category[]>("/api/categories"),
  getById: (id: number) => apiFetch<Category>(`/api/categories/${id}`),
  create: (data: Partial<Category>) =>
    apiFetch<Category>("/api/categories", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Category>) =>
    apiFetch<Category>(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    apiFetch(`/api/categories/${id}`, { method: "DELETE" }),
};

// Books
export const booksApi = {
  getAll: (params?: { category_id?: number; search?: string; featured?: boolean; include_unpublished?: boolean; skip?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category_id) searchParams.set("category_id", String(params.category_id));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.featured !== undefined) searchParams.set("featured", String(params.featured));
    if (params?.include_unpublished !== undefined) searchParams.set("include_unpublished", String(params.include_unpublished));
    if (params?.skip) searchParams.set("skip", String(params.skip));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const qs = searchParams.toString();
    return apiFetch<Book[]>(`/api/books${qs ? `?${qs}` : ""}`);
  },
  getLatest: (limit = 6) => apiFetch<Book[]>(`/api/books/latest?limit=${limit}`),
  getById: (id: number) => apiFetch<Book>(`/api/books/${id}`),
  create: (data: Partial<Book>) =>
    apiFetch<Book>("/api/books", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Book>) =>
    apiFetch<Book>(`/api/books/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch(`/api/books/${id}`, { method: "DELETE" }),
};

// Poems
export const poemsApi = {
  getAll: (params?: { category_id?: number; search?: string; include_unpublished?: boolean; skip?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category_id) searchParams.set("category_id", String(params.category_id));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.include_unpublished !== undefined) searchParams.set("include_unpublished", String(params.include_unpublished));
    if (params?.skip) searchParams.set("skip", String(params.skip));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const qs = searchParams.toString();
    return apiFetch<Poem[]>(`/api/poems${qs ? `?${qs}` : ""}`);
  },
  getLatest: (limit = 6) => apiFetch<Poem[]>(`/api/poems/latest?limit=${limit}`),
  getById: (id: number) => apiFetch<Poem>(`/api/poems/${id}`),
  create: (data: Partial<Poem>) =>
    apiFetch<Poem>("/api/poems", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Poem>) =>
    apiFetch<Poem>(`/api/poems/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch(`/api/poems/${id}`, { method: "DELETE" }),
};

// Upload
export const uploadApi = {
  uploadPdf: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch<{ url: string }>("/api/upload/pdf", {
      method: "POST",
      body: formData,
    });
  },
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch<{ url: string }>("/api/upload/image", {
      method: "POST",
      body: formData,
    });
  },
  uploadAudio: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch<{ url: string }>("/api/upload/audio", {
      method: "POST",
      body: formData,
    });
  },
};

// Fatwas
export const fatwasApi = {
  getApproved: (params?: { search?: string; topic?: string; skip?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.topic) searchParams.set("topic", params.topic);
    if (params?.skip) searchParams.set("skip", String(params.skip));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const qs = searchParams.toString();
    return apiFetch<Fatwa[]>(`/api/fatwas${qs ? `?${qs}` : ""}`);
  },
  getTopics: () => apiFetch<string[]>("/api/fatwas/topics"),
  submit: (data: Partial<Fatwa>) =>
    apiFetch<Fatwa>("/api/fatwas/submit", { method: "POST", body: JSON.stringify(data) }),
  lookupByCode: (code: string) =>
    apiFetch<Fatwa>(`/api/fatwas/lookup?code=${encodeURIComponent(code)}`),

  // Admin
  getPending: (status?: string) => {
    const qs = status ? `?status_filter=${status}` : "";
    return apiFetch<Fatwa[]>(`/api/fatwas/pending${qs}`);
  },
  getStats: () => apiFetch<{ total: number; pending: number; approved: number; rejected: number }>("/api/fatwas/stats"),
  answer: (id: number, data: { answer: string; status?: string }) =>
    apiFetch<any>(`/api/fatwas/${id}/answer`, { method: "PUT", body: JSON.stringify(data) }),
  reject: (id: number) => apiFetch<any>(`/api/fatwas/${id}/reject`, { method: "PUT" }),
  delete: (id: number) => apiFetch<any>(`/api/fatwas/${id}`, { method: "DELETE" }),
};

// Videos
export const videosApi = {
  getAll: (params?: { category?: string; search?: string; include_unpublished?: boolean; skip?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.include_unpublished !== undefined) searchParams.set("include_unpublished", String(params.include_unpublished));
    if (params?.skip) searchParams.set("skip", String(params.skip));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const qs = searchParams.toString();
    return apiFetch<Video[]>(`/api/videos${qs ? `?${qs}` : ""}`);
  },
  getLatest: (limit = 6) => apiFetch<Video[]>(`/api/videos/latest?limit=${limit}`),
  getById: (id: number) => apiFetch<Video>(`/api/videos/${id}`),
  create: (data: Partial<Video>) =>
    apiFetch<Video>("/api/videos", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Video>) =>
    apiFetch<Video>(`/api/videos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch(`/api/videos/${id}`, { method: "DELETE" }),
};

// Content
export const contentApi = {
  getAll: (section?: string) => {
    const qs = section ? `?section=${section}` : "";
    return apiFetch<SiteContent[]>(`/api/content${qs}`);
  },
  getByKey: (key: string) => apiFetch<SiteContent>(`/api/content/${key}`),
};

// Stats
export const statsApi = {
  getPublic: () => apiFetch<{ books: number; poems: number; fatwas: number; categories: number }>("/api/stats"),
};

/* ─── Type Definitions ─────────────────────────────────────── */
export interface Category {
  id: number;
  name: string;
  name_en?: string;
  description?: string;
  icon?: string;
  sort_order: number;
  parent_id?: number;
  children: Category[];
  book_count: number;
  poem_count: number;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  description?: string;
  cover_image?: string;
  pdf_path?: string;
  page_count?: number;
  publish_year?: string;
  is_published: boolean;
  is_featured: boolean;
  download_count: number;
  category_id?: number;
  category_name?: string;
  created_at?: string;
}

export interface Poem {
  id: number;
  title: string;
  author: string;
  description?: string;
  text_content: string;
  audio_path?: string;
  verse_count?: number;
  subject?: string;
  is_published: boolean;
  is_featured: boolean;
  category_id?: number;
  category_name?: string;
  created_at?: string;
}

export interface Fatwa {
  id: number;
  question: string;
  questioner_name?: string;
  questioner_email?: string;
  questioner_whatsapp?: string;
  topic?: string;
  answer?: string;
  status: string;
  is_private: boolean;
  notification_method: string;
  is_answered_and_sent: boolean;
  ticket_code?: string;
  answered_by?: string;
  created_at?: string;
  answered_at?: string;
}

export interface SiteContent {
  id: number;
  key: string;
  value: string;
  content_type: string;
  section?: string;
}

export interface Video {
  id: number;
  title: string;
  description?: string;
  youtube_url: string;
  youtube_id: string;
  category_name?: string;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}
