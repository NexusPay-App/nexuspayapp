import apiClient from './api';

// Types
export interface RegisterInitiateData {
    email: string;
    phoneNumber: string;
    password: string;
    verifyWith: 'email' | 'phone' | 'both';
}

export interface RegisterData {
    email: string;
    phoneNumber: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface LoginData {
    email?: string;
    phoneNumber?: string;
    password: string;
}

export interface VerifyEmailData {
    email: string;
    otp: string;
}

export interface VerifyPhoneData {
    phoneNumber: string;
    otp: string;
}

export interface VerifyLoginData {
    email?: string;
    phoneNumber?: string;
    otp: string;
}

export interface OTPRequestData {
    phoneNumber: string;
}

export interface OTPVerifyData {
    phoneNumber: string;
    otp: string;
}

export interface PasswordResetRequestData {
    email: string;
}

export interface PasswordResetData {
    email: string;
    otp: string;
    newPassword: string;
}

export interface GoogleAuthData {
    idToken: string;
    accessToken?: string;
}

export interface GoogleConfigResponse {
    clientId: string;
    redirectUri: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        sessionActive?: boolean;
        arbitrumWallet?: string;
        celoWallet?: string;
        walletAddress?: string;
        email?: string;
        phoneNumber?: string;
        registrationId?: string;
        verificationMethod?: string;
        user?: any;
    };
}

export interface User {
    walletStatus?: 'pending' | 'ready';
    hasPassword?: boolean;
    authMethods?: ('phone' | 'email' | 'google')[];
    name?: string;
    id?: string; // User ID for business account creation
    email: string;
    phoneNumber: string;
    googleId?: string; // Google account ID
    arbitrumWallet?: string;
    celoWallet?: string;
    walletAddress?: string;
    stellarAccountId?: string; // Stellar wallet address
    token?: never;
}

// Authentication API functions
export const authAPI = {
    // Initiate registration
    registerInitiate: async (data: RegisterInitiateData): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/register/initiate', data);
        return response.data;
    },

    // Complete registration
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    // Verify email during registration
    verifyEmail: async (data: VerifyEmailData): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/register/verify/email', data);
        return response.data;
    },

    // Verify phone during registration
    verifyPhone: async (data: VerifyPhoneData): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/register/verify/phone', data);
        return response.data;
    },

    // Login user
    login: async (data: LoginData): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/login', data);
        return response.data;
    },

    // Verify login OTP
    verifyLogin: async (data: VerifyLoginData): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/login/verify', data);
        return response.data;
    },

    // Request OTP (standalone phone authentication)
    requestOTP: async (data: OTPRequestData): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/otp', data);
        return response.data;
    },

    // Verify OTP (standalone phone authentication)
    verifyOTP: async (data: OTPVerifyData): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/verify-otp', data);
        return response.data;
    },

    // Request password reset
    requestPasswordReset: async (data: PasswordResetRequestData): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/password-reset/request', data);
        return response.data;
    },

    // Reset password
    resetPassword: async (data: PasswordResetData): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/password-reset', data);
        return response.data;
    },

    // Logout
    logout: async (): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/logout', {}, { timeout: 5000 });
        return response.data;
    },

    // Google Authentication
    googleAuth: async (data: GoogleAuthData): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/google', data);
        return response.data;
    },

    // Link Google Account
    linkGoogle: async (data: GoogleAuthData): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/google/link', data);
        return response.data;
    },

    // Get Google Config
    getGoogleConfig: async (): Promise<GoogleConfigResponse> => {
        const response = await apiClient.get('/auth/google-config');
        return response.data;
    },

    // Get user profile (includes user ID)
    getUserProfile: async (): Promise<AuthResponse> => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },
    // New: fetch current user with stable id
    getMe: async (): Promise<AuthResponse> => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};

let currentUser: User | null = null;
export const userUtils = {
    setUser: (user: User) => { currentUser = user; },
    getUser: (): User | null => currentUser,
    removeUser: () => { currentUser = null; },
    isAuthenticated: () => currentUser !== null,
};
export function getPostAuthPath(): '/home' | '/signup/business' {
    if (typeof window === 'undefined') return '/home';
    return new URLSearchParams(window.location.search).get('next') === '/signup/business' ? '/signup/business' : '/home';
}
