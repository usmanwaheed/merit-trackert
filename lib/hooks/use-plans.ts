import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/api/request';
import { toast } from 'sonner';

export interface Plan {
    id: string;
    name: string;
    description?: string;
    monthlyPrice: number;
    yearlyPrice: number;
    userLimit: number;
    features: string[];
}

export const planKeys = {
    all: ['subscription', 'plans'] as const,
};

export function usePlans() {
    return useQuery({
        queryKey: planKeys.all,
        queryFn: () => api.get<Plan[]>('/auth/subscription/plans'),
        staleTime: 10 * 60 * 1000,
    });
}

export function useSubscribeToPlan() {
    return useMutation({
        mutationFn: async ({ planId, period }: { planId: string; period: 'monthly' | 'yearly' }) => {
            const response = await api.post<{
                url: string;
            }>('/auth/subscription/upgrade', { planName: planId, period });

            if (response.url) {
                window.location.href = response.url;
            }
            return response;
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
}
