import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Создаем оригинальный экземпляр axios без интерцепторов
const originalApi = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Создаем расширенный экземпляр с интерцепторами
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Интерцептор запросов - сначала пробуем с access token
api.interceptors.request.use(config => {
    // Skip token check for auth endpoints
    if (config.url.startsWith('/auth/')) {
        return config;
    }

    const accessToken = localStorage.getItem('accessToken');
    console.log('Outgoing request to:', config.url);

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log('Added access token to headers');
    } else {
        console.warn('No access token found!');
    }

    return config;
});

// Интерцептор ответов
api.interceptors.response.use(
    response => {
        console.log('Response received:', {
            url: response.config.url,
            status: response.status
        });
        return response;
    },
    async error => {
        const originalRequest = error.config;
        console.error('Interceptor error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message
        });

        // Пропускаем ошибки без ответа
        if (!error.response) {
            console.error('Network Error:', error.message);
            return Promise.reject(error);
        }

        // Если получаем ошибку 401 или 403, пробуем с refresh token
        if ((error.response.status === 401 || error.response.status === 403) && 
            !originalRequest._retry && 
            !originalRequest._refreshTokenRetry) {
            
            console.log('Trying with refresh token instead');
            originalRequest._refreshTokenRetry = true;
            
            // Получаем refresh token
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (!refreshToken) {
                console.error('No refresh token available for retry');
                return Promise.reject(error);
            }
            
            // Создаем новый запрос с refresh token
            const retryConfig = { ...originalRequest };
            retryConfig.headers.Authorization = `Bearer ${refreshToken}`;
            
            try {
                console.log('Retrying request with refresh token');
                return await axios(retryConfig);
            } catch (retryError) {
                console.error('Retry with refresh token failed:', retryError.message);
                
                // Если refresh token не помог, пробуем обновить token
                if (retryError.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    
                    try {
                        const refreshToken = localStorage.getItem('refreshToken');
                        const userId = localStorage.getItem('userId');
                        
                        // Обновляем токены
                        const response = await originalApi.post(
                            `/auth/refresh-token`,
                            { refreshToken, userId }
                        );
                        
                        localStorage.setItem('accessToken', response.data.accessToken);
                        
                        // Повторяем оригинальный запрос с новым токеном
                        const newConfig = { ...originalRequest };
                        newConfig._retry = true;
                        newConfig._refreshTokenRetry = false;
                        newConfig.headers.Authorization = `Bearer ${response.data.accessToken}`;
                        
                        return axios(newConfig);
                    } catch (refreshError) {
                        // Если обновление токена не удалось, выходим из системы
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('userId');
                        
                        console.error('Token refresh failed, logging out');
                        
                        // Перенаправляем на страницу логина
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }
                
                return Promise.reject(retryError);
            }
        }

        // Обработка других ошибок
        const errorMessage = error.response.data?.message
            || `HTTP Error ${error.response.status}`;

        console.error('API Error:', {
            URL: error.config?.url,
            Status: error.response.status,
            Message: errorMessage
        });

        return Promise.reject(errorMessage);
    }
);

export const getAccountData = async (refreshToken) => {
    try {
        const response = await axios.get('/api/account/me', {
            headers: {
                'Refresh-Token': refreshToken
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch account data');
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/auth/register/user', {
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Registration failed');
    }
};

export const registerProfessional = async (professionalData) => {
    try {
        const response = await api.post('/auth/register/professional', {
            email: professionalData.email,
            password: professionalData.password,
            firstName: professionalData.firstName,
            lastName: professionalData.lastName,
            professionalTypeName: professionalData.professionalTypeName,
            experience: professionalData.experience,
            hourlyRate: professionalData.hourlyRate,
            education: professionalData.education,
            certifications: professionalData.certifications,
            languages: professionalData.languages,
            specializations: professionalData.specializations,
            about: professionalData.about,
            location: professionalData.location,
            contactPhone: professionalData.contactPhone,
            socialLinks: professionalData.socialLinks
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Professional registration failed');
    }
};

export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/auth/login', {
            email,
            password
        });

        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            return response.data;
        }
        throw new Error('Login failed');
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};

export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
};

// Добавьте эти функции в ваш существующий api.js файл

export const getNews = async () => {
    try {
        const response = await api.get('/news');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch news');
    }
};

export const getNewsPreviews = async () => {
    try {
        const response = await api.get('/news/preview');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch news previews');
    }
};

export const getNewsById = async (id) => {
    try {
        const response = await api.get(`/news/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch news');
    }
};

export const createNews = async (newsData) => {
    try {
        const token = localStorage.getItem('accessToken');
        console.log('Current token:', token); // Debug log

        if (!token) {
            throw new Error('Требуется авторизация');
        }

        const requestData = {
            title: newsData.title,
            preview: newsData.preview,
            fullContent: newsData.fullContent,
            imageUrl: newsData.imageUrl
        };
        console.log('Sending news data:', requestData); // Debug log

        const response = await axios.post(`${API_URL}/news`, requestData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response from server:', response.data); // Debug log
        return response.data;
    } catch (error) {
        console.error('Full error object:', error); // Debug log
        console.error('Error response:', error.response?.data); // Debug log
        console.error('Error status:', error.response?.status); // Debug log
        console.error('Error headers:', error.response?.headers); // Debug log
        
        throw new Error(
            error.response?.data?.message || 
            error.response?.data?.error || 
            'Failed to create news'
        );
    }
};

export const updateNews = async (id, newsData) => {
    try {
        const response = await api.put(`/news/${id}`, {
            title: newsData.title,
            preview: newsData.preview.substring(0, 500), // Limit preview to 500 characters
            fullContent: newsData.fullContent.substring(0, 5000), // Limit content to 5000 characters
            imageUrl: newsData.imageUrl
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update news');
    }
};

export const deleteNews = async (id) => {
    try {
        const response = await api.delete(`/news/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete news');
    }
};

// api.js
export const transferMoney = async (amount, toAccountId) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) {
            throw new Error('Требуется авторизация');
        }
        if (!toAccountId || !amount) {
            throw new Error("Укажите ID счета и сумму");
        }
        if (amount <= 0) {
            throw new Error("Сумма должна быть больше нуля");
        }

        const response = await axios.post(
            `${API_URL}/account/transfer`,
            {
                toAccountId: Number(toAccountId), // Теперь это поле идет первым
                amount: Number(amount),          // Затем amount
            },
            {
                headers: {
                    'Authorization': `Bearer ${refreshToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Transfer error:', error.response?.data);
        throw new Error(error.response?.data?.message || 'Ошибка при выполнении перевода');
    }
};

export const getAccountBalance = async () => {
    try {
        const response = await api.get('/account/me');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch account balance');
    }
};

export const getUserTransactions = async () => {
    try {
        const response = await api.get('/transactions/my');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
};

export const getLoanTransactions = async (loanId) => {
    try {
        const response = await api.get(`/transactions/loan/${loanId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch loan transactions');
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user data');
    }
};

export const getUserRole = async (username) => {
    try {
        const response = await api.get(`/user/role/${username}`);
        console.log('Получена роль пользователя:', response.data);
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении роли:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch user role');
    }
};

// Admin API functions
export const getAllUsers = async () => {
    try {
        const response = await api.get('/admin/users');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
};

export const getUserById = async (id) => {
    try {
        const response = await api.get(`/admin/user/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
};

export const createUser = async (userData) => {
    try {
        const response = await api.post('/admin/user', userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create user');
    }
};

export const updateUser = async (id, userData) => {
    try {
        const response = await api.put(`/admin/user/${id}`, userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update user');
    }
};

export const updateUserRole = async (id, roleName) => {
    try {
        const response = await api.put(`/admin/user/${id}/role/${roleName}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update user role');
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
};

export const getVipUsers = async () => {
    try {
        const response = await api.get('/admin/vip-users');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch VIP users');
    }
};

export const getBlockedUsers = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/blocked-users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch blocked users:', error);
        throw error;
    }
};

export const getUsersByRole = async (roleName) => {
    try {
        const response = await api.get(`/admin/users-by-role/${roleName}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch users by role');
    }
};

export const getAllRoles = async () => {
    try {
        const response = await api.get('/admin/roles');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch roles');
    }
};

export const getRoleByName = async (name) => {
    try {
        const response = await api.get(`/admin/roles/${name}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch role');
    }
};

export const updateRole = async (id, roleData) => {
    try {
        const response = await api.put(`/admin/roles/${id}`, roleData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update role');
    }
};

export const deleteRole = async (name) => {
    try {
        const response = await api.delete(`/admin/roles/${name}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete role');
    }
};

export const searchUsers = async (username) => {
    try {
        const response = await api.get(`/admin/users${username ? `?username=${username}` : ''}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to search users');
    }
};

export const updateVipStatus = async (userId, isVip) => {
    try {
        const response = await api.put('/vip/status', { userId, isVip });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update VIP status');
    }
};

// Get all pending loans for admin approval
export const getAllPendingLoans = async () => {
    try {
        const response = await api.get('/loans?status=PENDING');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch pending loans');
    }
};

// Get all loans with optional status filter
export const getAllLoans = async (status = null) => {
    try {
        const url = status ? `/loans?status=${status}` : '/loans';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch loans');
    }
};

// Get active loans
export const getActiveLoans = async () => {
    try {
        const response = await api.get('/loans?status=ACTIVE');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch active loans');
    }
};

// Get paid loans
export const getPaidLoans = async () => {
    try {
        const response = await api.get('/loans?status=PAID');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch paid loans');
    }
};

// Approve multiple loans at once
export const approveBulkLoans = async (loanIds) => {
    try {
        // Since bulk loan approval endpoint might not exist yet, we'll approve loans one by one
        const promises = loanIds.map(loanId => 
            api.post(`/loans/${loanId}/approve`)
        );
        await Promise.all(promises);
        return { success: true, message: 'Loans approved successfully' };
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to approve loans');
    }
};

// Create a new loan
export const createLoan = async (loanData) => {
    try {
        const response = await api.post('/loans', loanData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create loan');
    }
};

// Временная блокировка
export const blockUserTemporary = async (userId, days, reason) => {
    try {
        const response = await api.post(`/admin/user/${userId}/block/temporary`, {
            days: Number(days),  // Явное преобразование в число
            reason: reason || "" // Гарантируем строку
        });
        return response.data;
    } catch (error) {
        console.error('Error blocking user temporary:', error);
        throw new Error(error.response?.data?.message || 'Ошибка при временной блокировке');
    }
};

// Постоянная блокировка
export const blockUserPermanent = async (userId, reason) => {
    try {
        const response = await api.post(`/admin/user/${userId}/block/permanent`, {
            reason: reason || "" // Гарантируем строку
        });
        return response.data;
    } catch (error) {
        console.error('Error blocking user permanent:', error);
        throw new Error(error.response?.data?.message || 'Ошибка при постоянной блокировке');
    }
};

// Unblock user
export const unblockUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/admin/user/${userId}/unblock`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('refreshToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error unblocking user: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
};

// Professional API functions
export const getAllProfessionals = async () => {
    try {
        const response = await api.get('/professionals');
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
        const response = await api.put('/professionals/profile', {
            professionalTypeName: profileData.professionalTypeName,
            experience: profileData.experience,
            hourlyRate: profileData.hourlyRate,
            isAvailable: profileData.isAvailable,
            education: profileData.education,
            certifications: profileData.certifications,
            languages: profileData.languages,
            specializations: profileData.specializations,
            about: profileData.about,
            location: profileData.location,
            contactPhone: profileData.contactPhone,
            socialLinks: profileData.socialLinks
        });
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

export const uploadProfessionalPhoto = async (userId, photoFile) => {
    try {
        const formData = new FormData();
        formData.append('photo', photoFile);

        const response = await api.post(`/professionals/${userId}/photo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to upload professional photo');
    }
};

// Get all professional types
export const getProfessionalTypes = async () => {
    try {
        const response = await api.get('/professional-types');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch professional types');
    }
};

export default api;