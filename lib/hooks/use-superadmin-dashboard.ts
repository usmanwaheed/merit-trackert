// src/lib/hooks/use-superadmin-dashboard.ts
import { useQuery } from '@tanstack/react-query';
import { superadminApi } from '@/lib/api';

import { SuperadminCompany } from './use-superadmin-companies';
import { SuperadminTransaction } from './use-superadmin-transactions';

export interface SuperadminMetricsSummary {
    companies: number;
    users: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
}

export const superadminDashboardKeys = {
    all: ['superadmin', 'dashboard'] as const,
};

export function useSuperadminDashboardData() {
    return useQuery({
        queryKey: superadminDashboardKeys.all,
        queryFn: async () => {
            const [analyticsRes, companies, transactions] = await Promise.all([
                superadminApi.get<any>('/superadmin/analytics'),
                superadminApi.get<SuperadminCompany[]>('/superadmin/companies'),
                superadminApi.get<SuperadminTransaction[]>('/superadmin/transactions'),
            ]);

            return {
                metrics: analyticsRes.summary,
                companies,
                transactions
            };
        },
    });
}
