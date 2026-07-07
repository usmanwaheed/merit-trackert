// src/lib/hooks/use-superadmin-companies.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { superadminApi } from '@/lib/api';

export interface SuperadminCompany {
    id: string;
    name: string;
    email: string;
    plan: string;
    users: number;
    maxUsers: number;
    status: 'trial' | 'active' | 'expired' | 'cancelled' | 'suspended';
    createdAt: string;
}

export interface SuperadminPlan {
    id: string;
    name: string;
    tier: 'starter' | 'pro' | 'enterprise';
    pricePerMonth: number;
    pricePerYear: number;
    description: string;
    maxUsers: number;
    features: string[];
}

export const superadminCompaniesKeys = {
    all: ['superadmin', 'companies'] as const,
    plans: () => [...superadminCompaniesKeys.all, 'plans'] as const,
};

export function useSuperadminCompanies() {
    return useQuery({
        queryKey: superadminCompaniesKeys.all,
        queryFn: () => superadminApi.get<SuperadminCompany[]>('/superadmin/companies'),
    });
}

export function useSuperadminPlans() {
    return useQuery({
        queryKey: superadminCompaniesKeys.plans(),
        queryFn: () => superadminApi.get<SuperadminPlan[]>('/superadmin/plans'),
    });
}

export function useCreateSuperadminCompany() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { name: string; adminEmail: string; plan: string }) =>
            superadminApi.post<SuperadminCompany>('/superadmin/companies', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: superadminCompaniesKeys.all });
        },
    });
}

export interface UpdateSuperadminCompanyPayload {
    id: string;
    name?: string;
    adminEmail?: string;
    plan?: string;
    status?: 'trial' | 'active' | 'suspended';
}

export function useUpdateSuperadminCompany() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...payload }: UpdateSuperadminCompanyPayload) =>
            superadminApi.patch<SuperadminCompany>(`/superadmin/companies/${id}`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: superadminCompaniesKeys.all });
        },
    });
}

export function useDeleteSuperadminCompany() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => superadminApi.delete(`/superadmin/companies/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: superadminCompaniesKeys.all });
        },
    });
}
