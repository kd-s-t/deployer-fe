export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_DEPLOYER_DOMAIN || 'http://localhost:3011',
} as const;

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
