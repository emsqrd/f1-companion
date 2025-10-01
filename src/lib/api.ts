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
  ): Promise<T | null> {
    const { method = 'GET', data, headers: customHeaders } = config;
    const baseHeaders = await this.getBaseHeaders();

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: { ...baseHeaders, ...customHeaders },
        ...(data && method !== 'GET' && { body: JSON.stringify(data) }),
      });

      if (!response.ok) {
        // 404 is not an error - return null for "not found"
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API Error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Network error: ${error.message}`);
      }

      throw new Error('Unknown network error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T | null> {
    return this.makeRequest<T>(endpoint);
  }

  async post<T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> {
    const result = await this.makeRequest<T, D>(endpoint, { method: 'POST', data });
    // POST should never return null (404 on POST is a real error)
    return result!;
  }

  async patch<T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> {
    const result = await this.makeRequest<T, D>(endpoint, { method: 'PATCH', data });
    // PATCH should never return null (404 on PATCH is a real error)
    return result!;
  }
}

export const apiClient = new ApiClient();
