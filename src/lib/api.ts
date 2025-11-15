import * as Sentry from '@sentry/react';

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

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: { ...baseHeaders, ...customHeaders },
        ...(data && method !== 'GET' && { body: JSON.stringify(data) }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unable to read response body');
        const error = new Error(`${method} ${endpoint} failed: ${response.statusText}`) as Error & {
          status: number;
          responseBody?: string;
        };
        error.status = response.status;
        error.responseBody = errorBody;

        // Only capture 5xx server errors as exceptions (not 4xx client errors)
        const isServerError = response.status >= 500 && response.status < 600;

        if (isServerError) {
          // 5xx errors are unexpected server failures - capture as exceptions
          Sentry.withScope((scope) => {
            scope.setTag('api.endpoint', endpoint);
            scope.setTag('api.method', method);
            scope.setTag('api.status_code', response.status);
            scope.setContext('response', {
              body: errorBody,
            });

            // Structured log for server errors
            Sentry.logger.error(Sentry.logger.fmt`API server error: ${method} ${endpoint}`, {
              status: response.status,
              statusText: response.statusText,
              endpoint,
              method,
              responseBody: errorBody,
            });

            Sentry.captureException(error);
          });
        } else {
          // 4xx errors are expected client errors - log as warnings, not exceptions
          Sentry.logger.warn(Sentry.logger.fmt`API client error: ${method} ${endpoint}`, {
            status: response.status,
            statusText: response.statusText,
            endpoint,
            method,
            responseBody: errorBody,
          });
        }

        throw error;
      }

      // Handle empty responses (204 No Content or empty body)
      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');

      if (
        response.status === 204 ||
        contentLength === '0' ||
        !contentType?.includes('application/json')
      ) {
        return null as T;
      }

      // Check if response body is empty before parsing JSON
      const text = await response.text();
      if (!text || text.trim().length === 0) {
        return null as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      // Capture network errors and other exceptions
      if (error instanceof Error && !('status' in error)) {
        Sentry.withScope((scope) => {
          scope.setTag('api.endpoint', endpoint);
          scope.setTag('api.method', method);
          scope.setTag('error.type', 'network');

          // Structured log for network errors
          Sentry.logger.error(Sentry.logger.fmt`API network error: ${method} ${endpoint}`, {
            error: error.message,
            endpoint,
            method,
          });

          Sentry.captureException(error);
        });
      }

      throw error;
    }
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
