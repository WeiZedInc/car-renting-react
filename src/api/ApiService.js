import axios from 'axios';

// API base URL configuration
const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7179';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token to all requests
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    
    // Handle token expiration
    if (response && response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth services
const authService = {
  login: credentials => apiClient.post('/api/auth/login', credentials),
  register: userData => apiClient.post('/api/auth/register', userData),
  googleLogin: googleData => apiClient.post('/api/auth/google-login', googleData)
};

// Vehicle services
const vehicleService = {
  getAll: params => apiClient.get('/api/vehicles', { params }),
  getById: id => apiClient.get(`/api/vehicles/${id}`),
  getAvailable: (startDate, endDate, categoryId) => 
    apiClient.get('/api/vehicles/available', { 
      params: { startDate, endDate, categoryId } 
    }),
  search: query => apiClient.get('/api/vehicles/search', { params: { query } }),
  create: vehicleData => apiClient.post('/api/vehicles', vehicleData),
  update: (id, vehicleData) => apiClient.put(`/api/vehicles/${id}`, vehicleData),
  delete: id => apiClient.delete(`/api/vehicles/${id}`),
  getReviews: id => apiClient.get(`/api/vehicles/${id}/reviews`)
};

// Booking services
const bookingService = {
  getAll: params => apiClient.get('/api/bookings', { params }),
  getById: id => apiClient.get(`/api/bookings/${id}`),
  getUserBookings: () => apiClient.get('/api/bookings/my'),
  getPendingBookings: () => apiClient.get('/api/bookings/pending'),
  create: bookingData => apiClient.post('/api/bookings', bookingData),
  updateStatus: (id, status) => apiClient.put(`/api/bookings/${id}/status`, JSON.stringify(status), {
    headers: { 'Content-Type': 'application/json' }
  }),
  extendBooking: (id, newReturnDate) => apiClient.put(`/api/bookings/${id}/extend`, JSON.stringify(newReturnDate), {
    headers: { 'Content-Type': 'application/json' }
  }),
  cancelBooking: id => apiClient.put(`/api/bookings/${id}/cancel`)
};

// User services
const userService = {
  getAll: params => apiClient.get('/api/users', { params }),
  getById: id => apiClient.get(`/api/users/${id}`),
  getProfile: () => apiClient.get('/api/users/profile'),
  updateProfile: userData => apiClient.put('/api/users/profile', userData),
  updateRole: (id, role) => apiClient.put(`/api/users/${id}/role`, JSON.stringify(role), {
    headers: { 'Content-Type': 'application/json' }
  }),
  getDocuments: () => apiClient.get('/api/users/documents'),
  uploadDocument: documentData => apiClient.post('/api/users/documents', documentData),
  verifyDocument: id => apiClient.put(`/api/users/documents/${id}/verify`),
  getLoyalty: () => apiClient.get('/api/users/loyalty')
};

// Category services
const categoryService = {
  getAll: () => apiClient.get('/api/categories'),
  getById: id => apiClient.get(`/api/categories/${id}`),
  create: categoryData => apiClient.post('/api/categories', categoryData),
  update: (id, categoryData) => apiClient.put(`/api/categories/${id}`, categoryData),
  delete: id => apiClient.delete(`/api/categories/${id}`)
};

// Review services
const reviewService = {
  getVehicleReviews: vehicleId => apiClient.get(`/api/reviews/vehicle/${vehicleId}`),
  getUserReviews: () => apiClient.get('/api/reviews/user'),
  create: reviewData => apiClient.post('/api/reviews', reviewData),
  delete: id => apiClient.delete(`/api/reviews/${id}`)
};

// Damage report services
const damageService = {
  getAll: () => apiClient.get('/api/damages'),
  getById: id => apiClient.get(`/api/damages/${id}`),
  getByBooking: bookingId => apiClient.get(`/api/damages/booking/${bookingId}`),
  create: damageData => apiClient.post('/api/damages', damageData),
  update: (id, damageData) => apiClient.put(`/api/damages/${id}`, damageData),
  delete: id => apiClient.delete(`/api/damages/${id}`)
};

// File upload service
const fileService = {
  upload: async (file, folderName = 'documents') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderName', folderName);
    
    const response = await apiClient.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
};

export {
  authService,
  vehicleService,
  bookingService,
  userService,
  categoryService,
  reviewService,
  damageService,
  fileService
};