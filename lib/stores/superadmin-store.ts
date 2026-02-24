// src/lib/stores/superadmin-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Superadmin, SuperadminAuthResponse } from '@/lib/types';

const SUPERADMIN_TOKEN_KEY = 'superadmin_token';

interface SuperadminState {
    admin: Superadmin | null;
    token: string | null;
    isAuthenticated: boolean;
    rememberMe: boolean;

    login: (token: string, admin: SuperadminAuthResponse['admin'], rememberMe?: boolean) => void;
    logout: () => void;
    setAdmin: (admin: Superadmin) => void;
}

export const useSuperadminStore = create<SuperadminState>()(
    persist(
        (set) => ({
            admin: null,
            token: null,
            isAuthenticated: false,
            rememberMe: false,

            login: (token, admin, rememberMe = false) => {
                if (typeof window !== 'undefined') {
                    if (rememberMe) {
                        localStorage.setItem(SUPERADMIN_TOKEN_KEY, token);
                        sessionStorage.removeItem(SUPERADMIN_TOKEN_KEY);
                    } else {
                        sessionStorage.setItem(SUPERADMIN_TOKEN_KEY, token);
                        localStorage.removeItem(SUPERADMIN_TOKEN_KEY);
                    }
                    document.cookie = `${SUPERADMIN_TOKEN_KEY}=${token}; path=/; ${
                        rememberMe ? 'max-age=2592000;' : ''
                    }`;
                }

                set({ token, admin, isAuthenticated: true, rememberMe });
            },

            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(SUPERADMIN_TOKEN_KEY);
                    sessionStorage.removeItem(SUPERADMIN_TOKEN_KEY);
                    document.cookie = `${SUPERADMIN_TOKEN_KEY}=; Max-Age=0; path=/`;
                }

                set({
                    admin: null,
                    token: null,
                    isAuthenticated: false,
                    rememberMe: false,
                });
            },

            setAdmin: (admin) => set({ admin }),
        }),
        {
            name: 'superadmin-auth-storage',
            partialize: (state) => ({
                admin: state.admin,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                rememberMe: state.rememberMe,
            }),
        }
    )
);
