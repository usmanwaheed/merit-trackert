import { useQuery } from '@tanstack/react-query';
import { superadminApi } from '@/lib/api';

export interface AnalyticsData {
    summary: {
        companies: number;
        users: number;
        activeSubscriptions: number;
        monthlyRevenue: number;
    };
    planDistribution: Array<{
        name: string;
        value: number;
    }>;
    topCompanies: Array<{
        name: string;
        users: number;
    }>;
    revenueData: Array<{
        month: string;
        revenue: number;
        subscriptions: number;
    }>;
    userGrowthData: Array<{
        month: string;
        newUsers: number;
        churned: number;
    }>;
}

export const superadminAnalyticsKeys = {
    all: ['superadmin', 'analytics'] as const,
};

export function useSuperadminAnalytics() {
    return useQuery({
        queryKey: superadminAnalyticsKeys.all,
        queryFn: async () => {
            return superadminApi.get<AnalyticsData>('/superadmin/analytics');
        },
    });
}
