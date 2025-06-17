import axios from 'axios';

// Use empty baseURL so we don't duplicate the  prefix
const API_URL = '/api';

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
    // Log request for debugging
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    
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
    // Log the full error for debugging
    console.error('API Error:', error);
    
    const { response } = error;
    
    if (response) {
      // Handle token expiration
      if (response.status === 401) {
        // Clear invalid token
        localStorage.removeItem('token');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Log API errors for debugging
      console.error('API Error Details:', {
        status: response.status, 
        data: response.data,
        url: response.config?.url
      });
    } else {
      // Network error or server not responding
      console.error('Network Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth services
const authService = {
  login: credentials => apiClient.post('/auth/login', credentials),
  register: userData => apiClient.post('/auth/register', userData),
  googleLogin: googleData => apiClient.post('/auth/google-login', googleData)
};

// Vehicle services
const vehicleService = {
  getAll: params => apiClient.get('/vehicles', { params }),
  getById: id => apiClient.get(`/vehicles/${id}`),
  getAvailable: (startDate, endDate, categoryId) => 
    apiClient.get('/vehicles/available', { 
      params: { startDate, endDate, categoryId } 
    }),
  search: query => apiClient.get('/vehicles/search', { params: { query } }),
  create: vehicleData => apiClient.post('/vehicles', vehicleData),
  update: (id, vehicleData) => apiClient.put(`/vehicles/${id}`, vehicleData),
  delete: id => apiClient.delete(`/vehicles/${id}`),
  getReviews: id => apiClient.get(`/vehicles/${id}/reviews`)
};

// Booking services
const bookingService = {
  getAll: params => apiClient.get('/bookings', { params }),
  getById: id => apiClient.get(`/bookings/${id}`),
  getUserBookings: () => apiClient.get('/bookings/my'),
  getPendingBookings: () => apiClient.get('/bookings/pending'),
  create: bookingData => apiClient.post('/bookings', bookingData),
  updateStatus: (id, status) => apiClient.put(`/bookings/${id}/status`, JSON.stringify(status), {
    headers: { 'Content-Type': 'application/json' }
  }),
  extendBooking: (id, newReturnDate) => apiClient.put(`/bookings/${id}/extend`, JSON.stringify(newReturnDate), {
    headers: { 'Content-Type': 'application/json' }
  }),
  cancelBooking: id => apiClient.put(`/bookings/${id}/cancel`)
};

// User services
const userService = {
  getAll: params => apiClient.get('/users', { params }),
  getById: id => apiClient.get(`/users/${id}`),
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: userData => apiClient.put('/users/profile', userData),
  updateRole: (id, role) => apiClient.put(`/users/${id}/role`, JSON.stringify(role), {
    headers: { 'Content-Type': 'application/json' }
  }),
  getDocuments: () => apiClient.get('/users/documents'),
  uploadDocument: documentData => apiClient.post('/users/documents', documentData),
  verifyDocument: id => apiClient.put(`/users/documents/${id}/verify`),
  getLoyalty: () => apiClient.get('/users/loyalty')
};

// Category services
const categoryService = {
  getAll: () => apiClient.get('/categories'),
  getById: id => apiClient.get(`/categories/${id}`),
  create: categoryData => apiClient.post('/categories', categoryData),
  update: (id, categoryData) => apiClient.put(`/categories/${id}`, categoryData),
  delete: id => apiClient.delete(`/categories/${id}`)
};

// Review services
const reviewService = {
  getVehicleReviews: vehicleId => apiClient.get(`/reviews/vehicle/${vehicleId}`),
  getUserReviews: () => apiClient.get('/reviews/user'),
  create: reviewData => apiClient.post('/reviews', reviewData),
  delete: id => apiClient.delete(`/reviews/${id}`)
};

// Damage report services
const damageService = {
  getAll: () => apiClient.get('/damages'),
  getById: id => apiClient.get(`/damages/${id}`),
  getByBooking: bookingId => apiClient.get(`/damages/booking/${bookingId}`),
  create: damageData => apiClient.post('/damages', damageData),
  update: (id, damageData) => apiClient.put(`/damages/${id}`, damageData),
  delete: id => apiClient.delete(`/damages/${id}`)
};

// File upload service
const fileService = {
  upload: async (file, folderName = 'documents') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderName', folderName);
    
    const response = await apiClient.post('/files/upload', formData, {
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