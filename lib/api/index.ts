// src/lib/api/index.ts
export { api, request, getErrorMessage, BASE_URL } from './request';
export type { ApiError } from './request';
export { superadminApi, superadminRequest, SUPERADMIN_TOKEN_KEY } from './superadmin-request';