export const ROUTES = {
  DASHBOARD: '/',
  PROFILE: '/profile',
  LOGIN: '/login',
} as const;

export const PUBLIC_ROUTES = [ROUTES.LOGIN] as const;