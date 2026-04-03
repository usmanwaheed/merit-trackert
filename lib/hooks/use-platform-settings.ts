import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/request';

export interface PlatformSettings {
    platformName: string;
    supportEmail: string;
    platformDescription: string | null;
    trialDays: number;
    primaryColor: string;
    theme: string;
    logoUrl: string | null;
    faviconUrl: string | null;
    defaultCurrency: string;
    defaultTimezone: string;
}

export const platformSettingsKeys = {
    all: ['platform', 'settings'] as const,
};

export function usePlatformSettings() {
    return useQuery({
        queryKey: platformSettingsKeys.all,
        queryFn: () => api.get<PlatformSettings>('/auth/settings'),
    });
}
