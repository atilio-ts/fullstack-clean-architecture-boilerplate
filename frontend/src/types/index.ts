export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Route {
  path: string;
  element: React.ComponentType;
  title: string;
  icon?: React.ComponentType;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

