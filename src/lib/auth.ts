/**
 * Authentication utility functions
 */

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const getUserData = (): any | null => {
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    clearAuthData();
    return null;
  }
};

export const setAuthData = (token: string, user: any) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  const user = getUserData();
  return !!(token && user);
};

/**
 * Handle authentication errors by clearing stored data
 */
export const handleAuthError = () => {
  console.warn('Authentication error detected, clearing stored auth data');
  clearAuthData();
};
