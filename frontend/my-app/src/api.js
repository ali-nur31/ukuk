import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with interceptors
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(config => {
    // Skip token check for auth endpoints
    if (config.url.startsWith('/auth/')) {
        return config;
    }

    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// Response interceptor
api.interceptors.response.use(
    response => response,
    async error => {
        if (!error.response) {
            return Promise.reject(error);
        }

        if (error.response.status === 401 && !error.config._retry) {
            error.config._retry = true;
                    try {
                        const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
                        localStorage.setItem('accessToken', response.data.accessToken);
                error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
                return axios(error.config);
                    } catch (refreshError) {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/auth/register/user', userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Registration failed');
    }
};

export const registerProfessional = async (professionalData) => {
    try {
        const response = await api.post('/auth/register/professional', professionalData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Professional registration failed');
    }
};

export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};

export const getCurrentUser = async () => {
    try {
        console.log('Getting current user...');
        console.log('Access token:', localStorage.getItem('accessToken'));
        
        const response = await api.get('/auth/me');
        console.log('Response from /auth/me:', response.data);
        
        // Backend returns { user: {...}, professional: {...} }
        const userData = response.data.user || response.data;
        console.log('Processed user data:', userData);
        
        return userData;
    } catch (error) {
        console.error('Error in getCurrentUser:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        if (error.response?.status === 401) {
            console.log('Authentication error, clearing tokens...');
            // Clear tokens on authentication error
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch user data');
    }
};

// Professional endpoints
export const getAllProfessionals = async (params = {}) => {
    try {
        const response = await api.get('/professionals', { params });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch professionals');
    }
};

export const getProfessionalById = async (id) => {
    try {
        const response = await api.get(`/professionals/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch professional');
    }
};

export const updateProfessionalProfile = async (profileData) => {
    try {
        const response = await api.put('/professionals/profile', profileData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update professional profile');
    }
};

export const deleteProfessionalProfile = async () => {
    try {
        const response = await api.delete('/professionals/profile');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete professional profile');
    }
};

// Professional Types endpoints
export const getProfessionalTypes = async () => {
    try {
        const response = await api.get('/professional-types');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch professional types');
    }
};

export const getProfessionalTypeById = async (id) => {
    try {
        const response = await api.get(`/professional-types/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch professional type');
    }
};

export const createProfessionalType = async (typeData) => {
    try {
        const response = await api.post('/professional-types', typeData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create professional type');
    }
};

export const updateProfessionalType = async (id, typeData) => {
    try {
        const response = await api.put(`/professional-types/${id}`, typeData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update professional type');
    }
};

export const deleteProfessionalType = async (id) => {
    try {
        const response = await api.delete(`/professional-types/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete professional type');
    }
};

// User endpoints
export const getAllUsers = async () => {
    try {
        const response = await api.get('/users');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
};

export const getUserById = async (id) => {
    try {
        const response = await api.get(`/users/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
};

export const updateUser = async (id, userData) => {
    try {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update user');
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
};

// Chat endpoints
export const getChatHistory = async (userId, params = {}) => {
    try {
        const response = await api.get(`/chat/${userId}`, { params });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch chat history');
    }
};

export const sendMessage = async (messageData) => {
    try {
        const response = await api.post('/chat', messageData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to send message');
    }
};

export const getUnreadMessages = async () => {
    try {
        const response = await api.get('/chat/unread');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch unread messages');
    }
};

export const markMessagesAsRead = async (senderId) => {
    try {
        const response = await api.put(`/chat/read/${senderId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to mark messages as read');
    }
};

export default api;