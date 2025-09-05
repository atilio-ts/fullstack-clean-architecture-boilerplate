export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  LOGIN: '/login',
} as const;

export const PUBLIC_ROUTES = [ROUTES.LOGIN] as const;