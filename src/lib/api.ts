import { supabase } from './supabase';

type RequestConfig<D = unknown> = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  data?: D;
  headers?: HeadersInit;
};

class ApiClient {
  private baseUrl: string;

  constructor() {
    const envBaseUrl = import.meta.env.VITE_F1_FANTASY_API;
    if (!envBaseUrl) {
      throw new Error(
        'VITE_F1_FANTASY_API environment variable is not set. Please configure it in your environment.',
      );
    }
    this.baseUrl = envBaseUrl;
  }

  private async getBaseHeaders() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return {
      'Content-Type': 'application/json',
      ...(session?.access_token && {
        Authorization: `Bearer ${session.access_token}`,
      }),
    };
  }

  private async makeRequest<T, D = unknown>(
    endpoint: string,
    config: RequestConfig<D> = {},
  ): Promise<T> {
    const { method = 'GET', data, headers: customHeaders } = config;
    const baseHeaders = await this.getBaseHeaders();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: { ...baseHeaders, ...customHeaders },
      ...(data && method !== 'GET' && { body: JSON.stringify(data) }),
    });

    if (!response.ok) {
      const error = new Error(`${method} ${endpoint} failed: ${response.statusText}`) as Error & {
        status: number;
      };
      error.status = response.status;
      throw error;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint);
  }

  async post<T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> {
    return this.makeRequest<T, D>(endpoint, { method: 'POST', data });
  }

  async patch<T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> {
    return this.makeRequest<T, D>(endpoint, { method: 'PATCH', data });
  }
}

export const apiClient = new ApiClient();
