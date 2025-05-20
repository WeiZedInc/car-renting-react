import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-10 max-w-md text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-4">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-500 max-w-md">
        <p>
          If you believe this is an error, please contact our support team or try again later.
        </p>
      </div>
    </div>
  );
};

export default NotFound;