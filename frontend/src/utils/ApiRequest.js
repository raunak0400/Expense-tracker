// API Configuration - Use environment variable for production
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                    process.env.REACT_APP_BACKEND_URL || 
                    "http://localhost:5000";

// API Endpoints
export const setAvatarAPI = `${API_BASE_URL}/api/auth/setAvatar`;
export const registerAPI = `${API_BASE_URL}/api/auth/register`;
export const loginAPI = `${API_BASE_URL}/api/auth/login`;
export const addTransaction = `${API_BASE_URL}/api/v1/addTransaction`;
export const getTransactions = `${API_BASE_URL}/api/v1/getTransaction`;
export const editTransactions = `${API_BASE_URL}/api/v1/updateTransaction`;
export const deleteTransactions = `${API_BASE_URL}/api/v1/deleteTransaction`;

// Health check endpoint
export const healthCheckAPI = `${API_BASE_URL}/api/health`;

// Log API configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log(' API Base URL:', API_BASE_URL);
}