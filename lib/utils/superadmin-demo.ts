// src/lib/utils/superadmin-demo.ts
import { useSuperadminStore } from '@/lib/stores/superadmin-store';
import type { Superadmin } from '@/lib/types';

export const DEMO_SUPERADMIN_TOKEN = 'superadmin-demo-token';

export const DEMO_SUPERADMIN: Superadmin = {
    id: 'demo-superadmin-id',
    email: 'demo-superadmin@merittracker.app',
    firstName: 'Demo',
    lastName: 'Owner',
    role: 'SUPERADMIN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

export function startDemoSuperadminSession(rememberMe = true) {
    const { login } = useSuperadminStore.getState();
    login(DEMO_SUPERADMIN_TOKEN, DEMO_SUPERADMIN, rememberMe);
}
