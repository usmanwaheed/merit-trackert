// src/lib/api/superadmin-request.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { BASE_URL } from './request';
import { useSuperadminStore } from '@/lib/stores/superadmin-store';

export const SUPERADMIN_TOKEN_KEY = 'superadmin_token';

const instance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 40000,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
    },
});

instance.interceptors.request.use(
    (config) => {
        const auth = useSuperadminStore.getState();
        let token = auth.token;

        const storedToken =
            typeof window !== 'undefined'
                ? localStorage.getItem(SUPERADMIN_TOKEN_KEY) || sessionStorage.getItem(SUPERADMIN_TOKEN_KEY)
                : null;

        if (!token && storedToken) {
            useSuperadminStore.setState({ token: storedToken, isAuthenticated: true });
            token = storedToken;
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => Promise.reject(error)
);

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Superadmin API Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            fullError: JSON.stringify(error, null, 2)
        });

        if (error.response?.status === 401) {
            useSuperadminStore.getState().logout();

            if (typeof window !== 'undefined') {
                window.location.href = '/superadmin/login';
            }
        }

        return Promise.reject(error);
    }
);

interface RequestOptions {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: unknown;
    params?: unknown;
    headers?: Record<string, string>;
}

export async function superadminRequest<T>({
    url,
    method = 'GET',
    data,
    params,
    headers = {},
}: RequestOptions): Promise<T> {
    const requestHeaders: Record<string, string> = { ...headers };

    if (!(data instanceof FormData)) {
        requestHeaders['Content-Type'] = 'application/json';
    }

    const config: AxiosRequestConfig = {
        method,
        url,
        data,
        params,
        headers: requestHeaders,
    };

    const response: AxiosResponse<T> = await instance.request(config);
    return response.data;
}

export const superadminApi = {
    get: <T>(url: string, params?: unknown) =>
        superadminRequest<T>({ url, method: 'GET', params }),

    post: <T>(url: string, data?: unknown) =>
        superadminRequest<T>({ url, method: 'POST', data }),

    put: <T>(url: string, data?: unknown) =>
        superadminRequest<T>({ url, method: 'PUT', data }),

    patch: <T>(url: string, data?: unknown) =>
        superadminRequest<T>({ url, method: 'PATCH', data }),

    delete: <T>(url: string) =>
        superadminRequest<T>({ url, method: 'DELETE' }),
};
