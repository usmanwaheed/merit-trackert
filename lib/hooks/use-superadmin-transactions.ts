// src/lib/hooks/use-superadmin-transactions.ts
import { useQuery } from '@tanstack/react-query';
import { superadminApi } from '@/lib/api';

export interface SuperadminTransaction {
    id: string;
    company: string;
    type: 'payment' | 'refund';
    amount: number;
    status: 'completed' | 'pending' | 'failed';
    date: string;
    method: string;
    description: string;
}

export const superadminTransactionsKeys = {
    all: ['superadmin', 'transactions'] as const,
};

export function useSuperadminTransactions() {
    return useQuery({
        queryKey: superadminTransactionsKeys.all,
        queryFn: () => superadminApi.get<SuperadminTransaction[]>('/superadmin/transactions'),
    });
}
