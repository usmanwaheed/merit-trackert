import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superadminApi } from '@/lib/api';
import { toast } from 'sonner';

export interface SuperadminPlanSnapshot {
    id: string;
    name: string;
    pricePerMonth: number;
    pricePerYear: number;
}

export interface SuperadminSubscription {
    id: string;
    companyId: string;
    planId: string;
    status: 'trial' | 'active' | 'expired' | 'cancelled';
    period: 'monthly' | 'annual';
    renewsOn: string;
    seatsUsed: number;
    seatsAllowed: number;
    companyName?: string;
    planName?: string;
}

export const superadminSubscriptionsKeys = {
    all: ['superadmin', 'subscriptions'] as const,
};

export function useSuperadminSubscriptionsData() {
    return useQuery({
        queryKey: superadminSubscriptionsKeys.all,
        queryFn: async () => {
            const [subscriptions, plans] = await Promise.all([
                superadminApi.get<SuperadminSubscription[]>('/superadmin/subscriptions'),
                superadminApi.get<SuperadminPlanSnapshot[]>('/superadmin/plans'),
            ]);

            return { subscriptions, plans };
        },
    });
}

export function useCancelSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (companyId: string) => superadminApi.post(`/superadmin/subscriptions/${companyId}/cancel`, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: superadminSubscriptionsKeys.all });
            toast.success('Subscription cancelled successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to cancel subscription');
        },
    });
}
