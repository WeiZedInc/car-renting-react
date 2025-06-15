import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleAuth = ({ onError, buttonText = "Continue with Google" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [initError, setInitError] = useState(null);
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRef = useRef(null);
  
  const from = location.state?.from || '/';

  const handleGoogleResponse = async (response) => {
    try {
      setIsLoading(true);
      console.log('Google response received');
      
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }
      
      // Decode the JWT token manually
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const userInfo = JSON.parse(jsonPayload);
      console.log('Decoded user info:', { email: userInfo.email, name: userInfo.name });
      
      const googleData = {
        sub: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture
      };

      const result = await googleLogin(googleData);
      
      if (result.success) {
        console.log('Google login successful');
        navigate(from, { replace: true });
      } else {
        console.error('Google login failed:', result.message);
        onError(result.message || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      onError(`Google authentication failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeGoogleSignIn = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      const error = 'Google Client ID not found. Please add REACT_APP_GOOGLE_CLIENT_ID to your .env file';
      console.error(error);
      setInitError(error);
      onError(error);
      return;
    }

    console.log('Initializing Google Sign-In with Client ID:', clientId);
    console.log('Current origin:', window.location.origin);

    if (window.google && window.google.accounts) {
      try {
        // Initialize the Google Identity Services
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the Google Sign-In button
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'signin_with',
            width: 400,
            logo_alignment: 'left'
          });
        }
        
        setIsGoogleLoaded(true);
        setInitError(null);
        console.log('Google Sign-In initialized and button rendered successfully');
      } catch (error) {
        const errorMsg = `Failed to initialize Google Sign-In: ${error.message}`;
        console.error(errorMsg, error);
        setInitError(errorMsg);
        onError('Google authentication setup failed. Please check your configuration.');
      }
    } else {
      const error = 'Google Identity Services not available';
      console.error(error);
      setInitError(error);
    }
  };

  useEffect(() => {
    const loadGoogleScript = () => {
      // Check if script is already loaded
      const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (existingScript) {
        console.log('Google script already exists');
        if (window.google && window.google.accounts) {
          initializeGoogleSignIn();
        } else {
          // Script exists but not ready, wait a bit
          setTimeout(() => {
            if (window.google && window.google.accounts) {
              initializeGoogleSignIn();
            } else {
              console.error('Google services not available after script load');
              setInitError('Google services failed to load properly');
            }
          }, 1000);
        }
        return;
      }

      console.log('Loading Google Identity Services script...');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google script loaded successfully');
        // Give it a moment to initialize
        setTimeout(initializeGoogleSignIn, 300);
      };
      script.onerror = (error) => {
        console.error('Failed to load Google Identity Services script:', error);
        const errorMsg = 'Failed to load Google authentication. Please check your internet connection.';
        setInitError(errorMsg);
        onError(errorMsg);
      };
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  // Re-render button when component updates
  useEffect(() => {
    if (isGoogleLoaded && buttonRef.current && window.google && window.google.accounts) {
      try {
        // Clear the button container first
        buttonRef.current.innerHTML = '';
        
        // Re-render the button
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large', 
          type: 'standard',
          text: 'signin_with',
          width: 400,
          logo_alignment: 'left'
        });
      } catch (error) {
        console.error('Failed to re-render Google button:', error);
      }
    }
  }, [isGoogleLoaded, isLoading]);

  // Show configuration error if Client ID is missing
  if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
    return (
      <div className="w-full p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
        <div className="flex">
          <svg className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Google Authentication Not Configured</p>
            <p className="text-sm mt-1">Add REACT_APP_GOOGLE_CLIENT_ID to your .env file</p>
          </div>
        </div>
      </div>
    );
  }

  // Show initialization error
  if (initError) {
    return (
      <div className="w-full p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
        <div className="flex">
          <svg className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="font-medium">Google Authentication Error</p>
            <p className="text-sm mt-1">{initError}</p>
            <div className="mt-2 text-sm">
              <p className="font-medium">Current origin: {window.location.origin}</p>
              <p>Make sure this origin is added to Google Cloud Console.</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-sm underline hover:no-underline font-medium"
            >
              Reload page to retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {isLoading && (
        <div className="mb-4 flex items-center justify-center py-2">
          <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm text-gray-600">Signing in with Google...</span>
        </div>
      )}
      
      {/* Google button container */}
      <div 
        ref={buttonRef} 
        className={`w-full ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        style={{ minHeight: '40px' }}
      />
      
      {!isGoogleLoaded && !initError && (
        <div className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading Google Sign-In...
        </div>
      )}
    </div>
  );
};

export default GoogleAuth;