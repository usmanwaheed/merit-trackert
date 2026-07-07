// src/lib/hooks/use-superadmin-users.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { superadminApi } from '@/lib/api';

export interface SuperadminManagedUser {
    id: string;
    email: string;
    name: string;
    company: string;
    role: string;
    status: 'active' | 'invited' | 'suspended';
    lastActive: string;
    avatar?: string;
}

export const superadminUsersKeys = {
    all: ['superadmin', 'users'] as const,
};

export function useSuperadminUsers() {
    return useQuery({
        queryKey: superadminUsersKeys.all,
        queryFn: () => superadminApi.get<SuperadminManagedUser[]>('/superadmin/users'),
    });
}

export function useSuperadminUpdateUserRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, role }: { id: string; role: string }) =>
            superadminApi.patch<SuperadminManagedUser>(`/superadmin/users/${id}/role`, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: superadminUsersKeys.all });
        },
    });
}

export function useSuperadminDeactivateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => superadminApi.patch<SuperadminManagedUser>(`/superadmin/users/${id}/deactivate`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: superadminUsersKeys.all });
        },
    });
}

export function useSuperadminActivateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => superadminApi.patch<SuperadminManagedUser>(`/superadmin/users/${id}/activate`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: superadminUsersKeys.all });
        },
    });
}

export function useSuperadminResetUserPassword() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, password }: { id: string; password: string }) =>
            superadminApi.patch<SuperadminManagedUser>(`/superadmin/users/${id}/password`, { password }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: superadminUsersKeys.all });
        },
    });
}

export function useSuperadminDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => superadminApi.delete(`/superadmin/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: superadminUsersKeys.all });
        },
    });
}
