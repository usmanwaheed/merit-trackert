import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { superadminApi } from '@/lib/api';
import { toast } from 'sonner';

export interface SuperadminSettings {
    id?: string;
    platformName: string;
    supportEmail: string;
    platformDescription: string | null;
    defaultTimezone: string;
    defaultCurrency: string;
    stripePublicKey: string | null;
    stripeSecretKey: string | null;
    trialDays: number;
    autoRetryFailedPayments: boolean;
    autoInvoiceGeneration: boolean;
    primaryColor: string;
    theme: string;
    logoUrl: string | null;
    faviconUrl: string | null;
}

export const superadminSettingsKeys = {
    all: ['superadmin', 'settings'] as const,
};

export function useSuperadminSettings() {
    return useQuery({
        queryKey: superadminSettingsKeys.all,
        queryFn: () => superadminApi.get<SuperadminSettings>('/superadmin/settings'),
    });
}

export function useUpdateSuperadminSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<SuperadminSettings>) =>
            superadminApi.put('/superadmin/settings', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: superadminSettingsKeys.all });
            toast.success('Settings updated successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update settings');
        },
    });
}
