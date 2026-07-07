import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { superadminApi } from '@/lib/api';
import { toast } from 'sonner';

export interface SuperadminPlan {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    userLimit: number;
    storageLimit: number;
    features: string[];
    isPopular: boolean;
    isActive: boolean;
    tier?: 'starter' | 'pro' | 'enterprise'; // Optional for UI logic
}

export interface CreatePlanDto {
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    userLimit: number;
    storageLimit?: number;
    features: string[];
    isPopular?: boolean;
    isActive?: boolean;
}

export const superadminPlansKeys = {
    all: ['superadmin', 'plans'] as const,
};

export function useSuperadminPlansData() {
    return useQuery({
        queryKey: superadminPlansKeys.all,
        queryFn: () => superadminApi.get<SuperadminPlan[]>('/superadmin/plans'),
    });
}

export function useCreateSuperadminPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePlanDto) => superadminApi.post('/superadmin/plans', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: superadminPlansKeys.all });
            toast.success('Plan created successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to create plan');
        },
    });
}

export function useUpdateSuperadminPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...data }: Partial<CreatePlanDto> & { id: string }) =>
            superadminApi.put(`/superadmin/plans/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: superadminPlansKeys.all });
            toast.success('Plan updated successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update plan');
        },
    });
}

export function useDeleteSuperadminPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => superadminApi.delete(`/superadmin/plans/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: superadminPlansKeys.all });
            toast.success('Plan deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to delete plan');
        },
    });
}
