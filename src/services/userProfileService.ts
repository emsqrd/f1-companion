import type { CreateProfileData } from '@/contracts/CreateProfileData';
import type { UserProfile } from '@/contracts/UserProfile';
import { apiClient } from '@/lib/api';

export const userProfileService = {
  async registerUser(data: CreateProfileData): Promise<UserProfile> {
    return apiClient.post<UserProfile, CreateProfileData>('/me/register', data);
  },

  async getCurrentProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/me/profile');
  },

  async updateUserProfile(data: UserProfile): Promise<UserProfile> {
    return apiClient.patch<UserProfile, Partial<UserProfile>>('/me/profile', data);
  },
};
