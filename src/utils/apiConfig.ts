import axios from 'axios';
import { authService } from '@/services/authService';

export const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.mockylab.com'}/api`;
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.mockylab.com';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      authService.logout();
      window.location.href = '/login';
      return Promise.reject(new Error('Authentication failed. Please login again.'));
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const AUTH_ENDPOINTS = {
  login: '/Auth/login'
};

// Tam URL oluşturmak için yardımcı fonksiyon
export const getFullUrl = (endpoint: string) => `${API_URL}${endpoint}`;

// API endpoints
export const endpoints = {
  auth: {
    login: '/Auth/login',
    refreshToken: '/Auth/refresh-token',
  },
  user: {
    printifySettings: '/User/printify-settings',
    printifyApiKey: '/User/printify-api-key',
    shopId: '/User/shop-id',
    blueprints: (userId: string) => `/UserOfBlueprint/user/${userId}`,
  },
  printify: {
    blueprints: {
      list: '/Printify/blueprints',
      details: (id: string) => `/Printify/blueprints/${id}`,
      variants: (blueprintId: string) => `/Printify/blueprints/${blueprintId}/variants`,
      syncVariants: (blueprintId: string) => `/Printify/blueprints/${blueprintId}/variants/sync`,
    },
    products: '/Printify/products',
    images: {
      upload: '/PrintifyImage/upload',
    },
  },
  mockup: {
    list: '/Mockup',
    details: (id: number) => `/Mockup/${id}`,
    create: '/Mockup',
    update: (id: number) => `/Mockup/${id}`,
    delete: (id: number) => `/Mockup/${id}`,
    designAreas: {
      list: (mockupId: number) => `/mockups/${mockupId}/design-areas`,
      create: (mockupId: number) => `/mockups/${mockupId}/design-areas`,
      update: (mockupId: number, areaId: number) => `/mockups/${mockupId}/design-areas/${areaId}`,
      delete: (mockupId: number, areaId: number) => `/mockups/${mockupId}/design-areas/${areaId}`,
    },
  },
  favorite: {
    lists: {
      list: (userId: string) => `/Favorite/${userId}/lists`,
      create: (userId: string) => `/Favorite/${userId}/lists`,
      delete: (listId: number) => `/Favorite/lists/${listId}`,
      mockups: {
        add: (listId: number) => `/Favorite/lists/${listId}/mockups/batch`,
        remove: (listId: number, mockupId: number) => `/Favorite/lists/${listId}/mockups/${mockupId}`,
      },
    },
  },
  ideogram: {
    getDescription: '/Ideogram/get-description',
    remix: '/Ideogram/remix',
  },
};

// Helper function to get user ID from token
export const getCurrentUserId = (): string => {
  const user = authService.getCurrentUser();
  if (!user?.nameIdentifier) {
    throw new Error('User ID not found');
  }
  return user.nameIdentifier;
};

// Error handler helper
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.title) {
      return error.response.data.title;
    }
    if (typeof error.response?.data === 'string') {
      return error.response.data;
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}; 