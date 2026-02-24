// src/lib/hooks/use-superadmin-auth.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { superadminApi, getErrorMessage } from '@/lib/api';
import type {
  SuperadminAuthResponse,
  SuperadminLoginRequest,
  SuperadminRegisterRequest,
} from '@/lib/types';
import { useSuperadminStore } from '@/lib/stores/superadmin-store';

/**
 * Backend returns:
 * {
 *   access_token: string,
 *   superadmin: {...}
 * }
 * Some environments might return `admin` instead of `superadmin`,
 * so we support both and normalize to `{ access_token, superadmin }`.
 */
type SuperadminAuthPayload =
  | (SuperadminAuthResponse & { admin?: SuperadminAuthResponse['superadmin'] })
  | {
    access_token?: string;
    superadmin?: SuperadminAuthResponse['superadmin'];
    admin?: SuperadminAuthResponse['superadmin'];
  };

function normalizeSuperadminAuthResponse(payload: SuperadminAuthPayload): SuperadminAuthResponse {
  const access_token =
    typeof (payload as any)?.access_token === 'string' ? (payload as any).access_token : '';

  const superadmin =
    (payload as any)?.superadmin ?? (payload as any)?.admin ?? null;

  if (!access_token || !superadmin) {
    throw new Error('Invalid authentication response from server');
  }

  return { access_token, superadmin };
}

function assertValidAuthResponse(res: SuperadminAuthResponse): void {
  if (!res.access_token || !res.superadmin) {
    throw new Error('Invalid authentication response');
  }
}

/* ============================================================
   SUPERADMIN LOGIN
============================================================ */
export function useSuperadminLogin() {
  const router = useRouter();
  const login = useSuperadminStore((s) => s.login);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SuperadminLoginRequest & { rememberMe?: boolean }) =>
      superadminApi
        .post<SuperadminAuthPayload>('/superadmin/auth/login', {
          email: data.email,
          password: data.password,
        })
        .then(normalizeSuperadminAuthResponse),

    onSuccess: (res, variables) => {
      try {
        assertValidAuthResponse(res);

        login(res.access_token, res.superadmin, variables.rememberMe);
        queryClient.clear();

        toast.success(`Welcome back, ${res.superadmin.firstName}!`);
        router.push('/superadmin/dashboard');
      } catch (err) {
        toast.error((err as Error).message);
      }
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/* ============================================================
   SUPERADMIN REGISTER
============================================================ */
export function useSuperadminRegister() {
  const router = useRouter();
  const login = useSuperadminStore((s) => s.login);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SuperadminRegisterRequest) =>
      superadminApi
        .post<SuperadminAuthPayload>('/superadmin/auth/register', data)
        .then(normalizeSuperadminAuthResponse),

    onSuccess: (res) => {
      try {
        assertValidAuthResponse(res);

        login(res.access_token, res.superadmin, true);
        queryClient.clear();

        toast.success(`Superadmin account created. Welcome, ${res.superadmin.firstName}!`);
        router.push('/superadmin/dashboard');
      } catch (err) {
        toast.error((err as Error).message);
      }
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/* ============================================================
   SUPERADMIN LOGOUT
============================================================ */
export function useSuperadminLogout() {
  const router = useRouter();
  const logout = useSuperadminStore((s) => s.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // If we had a server-side logout endpoint, we'd call it here
      // await superadminApi.post('/superadmin/auth/logout');
      logout();
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/superadmin/login');
    },
  });
}
