import {
  type MockedFunction,
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { apiClient } from './api';
import { supabase } from './supabase';

// Mock the supabase module
vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

describe('ApiClient', () => {
  const mockFetch = vi.fn() as MockedFunction<typeof fetch>;
  const mockGetSession = vi.mocked(supabase.auth.getSession);

  beforeAll(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Default session mock - no auth token
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  describe('get method', () => {
    it('should make successful GET request with no authentication', async () => {
      const mockResponseData = { id: 1, name: 'Test Data' };
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponseData),
      };

      mockFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

      const result = await apiClient.get('/test-endpoint');

      expect(result).toEqual(mockResponseData);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/test-endpoint'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(mockGetSession).toHaveBeenCalledTimes(1);
    });

    it('should include authorization header when user is authenticated', async () => {
      const mockResponseData = { id: 1, name: 'Authenticated Data' };
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponseData),
      };
      const mockAccessToken = 'test-access-token';

      mockGetSession.mockResolvedValue({
        data: {
          session: {
            access_token: mockAccessToken,
          },
        },
        error: null,
      } as unknown as Awaited<ReturnType<typeof supabase.auth.getSession>>);

      mockFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

      const result = await apiClient.get('/authenticated-endpoint');

      expect(result).toEqual(mockResponseData);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/authenticated-endpoint'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockAccessToken}`,
        },
      });
    });

    it('should handle API errors and throw meaningful error messages', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      };

      mockFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

      await expect(apiClient.get('/nonexistent-endpoint')).rejects.toThrow('API Error: Not Found');
    });

    it('should handle network errors and throw meaningful error messages', async () => {
      const networkError = new Error('Network connection failed');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(apiClient.get('/network-error')).rejects.toThrow(
        'Network error: Network connection failed',
      );
    });

    it('should handle unknown errors and throw generic message', async () => {
      // Simulate throwing a non-Error object
      mockFetch.mockRejectedValueOnce('Unknown error');

      await expect(apiClient.get('/unknown-error')).rejects.toThrow(
        'Unknown network error occurred',
      );
    });
  });

  describe('post method', () => {
    it('should make successful POST request with data', async () => {
      const postData = { name: 'New Item', description: 'Test description' };
      const mockResponseData = { id: 1, ...postData };
      const mockResponse = {
        ok: true,
        status: 201,
        json: vi.fn().mockResolvedValue(mockResponseData),
      };

      mockFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

      const result = await apiClient.post('/create-item', postData);

      expect(result).toEqual(mockResponseData);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/create-item'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
    });

    it('should make POST request with authentication when user is signed in', async () => {
      const postData = { name: 'Authenticated Item' };
      const mockResponseData = { id: 2, ...postData };
      const mockResponse = {
        ok: true,
        status: 201,
        json: vi.fn().mockResolvedValue(mockResponseData),
      };
      const mockAccessToken = 'authenticated-token';

      mockGetSession.mockResolvedValue({
        data: {
          session: {
            access_token: mockAccessToken,
          },
        },
        error: null,
      } as unknown as Awaited<ReturnType<typeof supabase.auth.getSession>>);

      mockFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

      const result = await apiClient.post('/authenticated-create', postData);

      expect(result).toEqual(mockResponseData);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/authenticated-create'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockAccessToken}`,
        },
        body: JSON.stringify(postData),
      });
    });

    it('should handle POST request errors', async () => {
      const postData = { invalid: 'data' };
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      };

      mockFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

      await expect(apiClient.post('/bad-request', postData)).rejects.toThrow(
        'API Error: Bad Request',
      );
    });

    it('should handle empty POST data', async () => {
      const mockResponseData = { success: true };
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponseData),
      };

      mockFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

      const result = await apiClient.post('/empty-post', {});

      expect(result).toEqual(mockResponseData);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/empty-post'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
    });
  });

  describe('patch method', () => {
    it('should make successful PATCH request with data', async () => {
      const patchData = { name: 'Updated Name' };
      const mockResponseData = { id: 1, name: 'Updated Name', updated: true };
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponseData),
      };

      mockFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

      const result = await apiClient.patch('/update-item/1', patchData);

      expect(result).toEqual(mockResponseData);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/update-item/1'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patchData),
      });
    });

    it('should make PATCH request with authentication', async () => {
      const patchData = { status: 'active' };
      const mockResponseData = { id: 1, status: 'active' };
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponseData),
      };
      const mockAccessToken = 'patch-token';

      mockGetSession.mockResolvedValue({
        data: {
          session: {
            access_token: mockAccessToken,
          },
        },
        error: null,
      } as unknown as Awaited<ReturnType<typeof supabase.auth.getSession>>);

      mockFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

      const result = await apiClient.patch('/authenticated-update/1', patchData);

      expect(result).toEqual(mockResponseData);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/authenticated-update/1'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockAccessToken}`,
        },
        body: JSON.stringify(patchData),
      });
    });

    it('should handle PATCH request errors', async () => {
      const patchData = { invalid: 'update' };
      const mockResponse = {
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
      };

      mockFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

      await expect(apiClient.patch('/invalid-update/1', patchData)).rejects.toThrow(
        'API Error: Unprocessable Entity',
      );
    });
  });

  describe('session management', () => {
    it('should call getSession for each request to get fresh auth state', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      // Make multiple requests
      await apiClient.get('/request1');
      await apiClient.post('/request2', {});
      await apiClient.patch('/request3', {});

      // Should call getSession once for each request
      expect(mockGetSession).toHaveBeenCalledTimes(3);
    });

    it('should handle session retrieval errors gracefully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      };

      // Simulate session error
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session error' },
      } as unknown as Awaited<ReturnType<typeof supabase.auth.getSession>>);

      mockFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

      // Should still work without auth token
      await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/test'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle mixed authenticated and non-authenticated requests', async () => {
      const mockToken = 'test-token';

      // First request - no auth
      mockGetSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ public: true }),
      } as unknown as Response);

      // Second request - with auth
      mockGetSession.mockResolvedValueOnce({
        data: {
          session: {
            access_token: mockToken,
          },
        },
        error: null,
      } as unknown as Awaited<ReturnType<typeof supabase.auth.getSession>>);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ private: true }),
      } as unknown as Response);

      await apiClient.get('/public');
      await apiClient.get('/private');

      const [firstCall, secondCall] = mockFetch.mock.calls;

      expect(firstCall?.[1]).toEqual({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(secondCall?.[1]).toEqual({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
      });
    });
  });

  describe('error handling edge cases', () => {
    it('should handle fetch throwing TypeError for network issues', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(apiClient.get('/network-failure')).rejects.toThrow(
        'Network error: Failed to fetch',
      );
    });

    it('should handle response.json() failing', async () => {
      const jsonError = new Error('Invalid JSON');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockRejectedValue(jsonError),
      } as unknown as Response);

      // Based on testing, the API client is not currently wrapping json() errors
      // This is actually the current behavior - the json parsing error comes through directly
      await expect(apiClient.get('/invalid-json')).rejects.toThrow('Invalid JSON');
    });

    it('should handle empty response body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: vi.fn().mockResolvedValue(null),
      } as unknown as Response);

      const result = await apiClient.get('/empty-response');
      expect(result).toBeNull();
    });
  });

  describe('request configuration', () => {
    it('should use correct base URL from environment variable', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      };

      mockFetch.mockResolvedValueOnce(mockResponse as unknown as Response);

      await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(import.meta.env.VITE_F1_FANTASY_API),
        expect.any(Object),
      );
    });

    it('should properly format endpoint URLs', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.get('/users');
      await apiClient.get('/users/123');
      await apiClient.get('/users/123/teams');

      const calls = mockFetch.mock.calls;
      expect(calls[0]?.[0]).toContain('/users');
      expect(calls[1]?.[0]).toContain('/users/123');
      expect(calls[2]?.[0]).toContain('/users/123/teams');
    });
  });
});
