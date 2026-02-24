// src/lib/hooks/use-superadmin-users.ts
import { useQuery } from '@tanstack/react-query';
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
