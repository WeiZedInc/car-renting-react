import React, { createContext, useState, useContext, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import { authService, userService } from '../api/ApiService';

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Validate token by decoding it
          const decodedToken = jwtDecode(token);
          
          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp < currentTime) {
            // Token is expired
            logout();
            setLoading(false);
            return;
          }
          
          // Set user and role from token
          setCurrentUser({
            id: decodedToken.nameid || decodedToken.name,
            email: decodedToken.email
          });
          
          setUserRole(decodedToken.role);
          setIsAuthenticated(true);
          
          // Get full user profile
          try {
            const response = await userService.getProfile();
            setCurrentUser(response.data);
          } catch (err) {
            console.error('Error fetching user profile:', err);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error checking authentication:', err);
        logout();
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);
  
  // Login user
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      // Decode token to get user role
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response && err.response.data) {
        errorMessage = err.response.data;
      }
      
      return { success: false, message: errorMessage };
    }
  };
  
  // Register user
  const register = async (userData) => {
    try {
      await authService.register(userData);
      return { success: true };
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response && err.response.data) {
        errorMessage = err.response.data;
      }
      
      return { success: false, message: errorMessage };
    }
  };
  
  // Google Login
  const googleLogin = async (googleData) => {
    try {
      const response = await authService.googleLogin({
        googleId: googleData.sub,
        email: googleData.email,
        name: googleData.name
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      // Decode token to get user role
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      let errorMessage = 'Google login failed. Please try again.';
      
      if (err.response && err.response.data) {
        errorMessage = err.response.data;
      }
      
      return { success: false, message: errorMessage };
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
  };
  
  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await userService.updateProfile(userData);
      setCurrentUser(response.data);
      return { success: true };
    } catch (err) {
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (err.response && err.response.data) {
        errorMessage = err.response.data;
      }
      
      return { success: false, message: errorMessage };
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        googleLogin,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth Context
export const useAuth = () => {
  return useContext(AuthContext);
};