import api from './api';
import type { ApiResponse } from '@/types/api.types';
// Note: Removed ApiError from usage if not needed, or keep it.
// Actually interface for Member/ProfileData is here.

export interface Member {
    id: string;
    userEmail: string;
    name: string;
    avatar?: string;
    isPrimaryMember: boolean;
    dob?: string;
    age?: number;
    relation?: string;
    interestProfile?: any;
    locationDetails?: any;
    travelProfile?: any;
    travelInstructions?: any;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile {
    email: string;
    name: string;
    phoneNumber?: string;
    emailVerified: boolean;
    phoneNumberVerified: boolean;
    authProvider: string;
}

export interface ProfileData {
    user: UserProfile;
    members: Member[];
}

export const getProfile = async (): Promise<ApiResponse<ProfileData>> => {
    const response = await api.get('/profile');
    return response.data;
};

export const addMember = async (data: Partial<Member>): Promise<ApiResponse<Member>> => {
    const response = await api.post('/profile', data);
    return response.data;
};

export const deleteMember = async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/profile/${id}`);
    return response.data;
};
