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
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ planId, period }: { planId: string; period: 'monthly' | 'yearly' }) => {
            return api.post<{
                success: boolean;
                message: string;
                company: any;
            }>('/auth/subscription/upgrade', { planName: planId, period });
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['auth', 'subscription'] });
            queryClient.invalidateQueries({ queryKey: ['auth', 'company-stats'] });
            toast.success(data.message);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
}
