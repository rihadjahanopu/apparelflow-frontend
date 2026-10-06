import {
  User,
  Recipe,
  CuttingOrder,
  UserRole,
} from '../types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? '/api' : 'http://localhost:4000/api');

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('apparelflow_token');
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error: any = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.error = data.error;
      error.shortages = data.shortages;
      throw error;
    }

    return data as T;
  }

  // Auth & Demo
  auth = {
    login: (credentials: { email: string; password: string }) =>
      this.request<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (payload: { email: string; password: string; full_name: string; role: UserRole }) =>
      this.request<{ token: string; user: User; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getDemoUsers: () => this.request<{ users: User[] }>('/auth/demo-users'),
    switchDemoRole: (role: UserRole) =>
      this.request<{ token: string; user: User }>('/auth/demo-switch', {
        method: 'POST',
        body: JSON.stringify({ role }),
      }),
    getMe: () => this.request<{ user: User }>('/auth/me'),
    updateProfile: (payload: { full_name?: string; current_password?: string; new_password?: string }) =>
      this.request<{ message: string; user: User; token: string }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
  };

  // Recipes
  recipes = {
    list: () => this.request<{ recipes: Recipe[] }>('/recipes'),
    get: (id: number) => this.request<{ recipe: Recipe }>(`/recipes/${id}`),
  };

  // Cutting Orders
  orders = {
    list: (status?: string) => {
      const query = status ? `?status=${encodeURIComponent(status)}` : '';
      return this.request<{ orders: CuttingOrder[] }>(`/orders${query}`);
    },
    get: (id: number) => this.request<{ order: CuttingOrder }>(`/orders/${id}`),
    create: (payload: {
      recipe_id: number;
      target_qty: number;
      fabric_roll_id: string;
      actual_fabric_yds: number;
      initial_counts_matched?: boolean;
    }) =>
      this.request<{ message: string; order: CuttingOrder }>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  };

  // Verification & Gatekeeper Terminal
  verify = {
    updateCounts: (orderId: number, items: Array<{ component_id: number; actual_qty: number }>) =>
      this.request<{ message: string; order: CuttingOrder }>(`/verify/${orderId}/items`, {
        method: 'PUT',
        body: JSON.stringify({ items }),
      }),
    approve: (orderId: number) =>
      this.request<{ message: string; order: CuttingOrder; log: any }>('/verify/' + orderId + '/approve', {
        method: 'POST',
      }),
    reject: (orderId: number, rejection_note: string) =>
      this.request<{ message: string; order: CuttingOrder; log: any }>('/verify/' + orderId + '/reject', {
        method: 'POST',
        body: JSON.stringify({ rejection_note }),
      }),
  };

  // Sewing Floor Operations
  sewing = {
    getQueue: () => this.request<{ queue: CuttingOrder[] }>('/sewing/queue'),
    startSewing: (orderId: number) =>
      this.request<{ message: string; order: CuttingOrder }>(`/sewing/start/${orderId}`, {
        method: 'POST',
      }),
  };
}

export const api = new ApiClient();

