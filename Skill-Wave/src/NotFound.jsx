import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600">404 - Page Not Found</h1>
      <p className="mt-4 text-gray-600">The page you are looking for does not exist.</p>
      <Link to="/login" className="mt-6 px-4 py-2 bg-orange-600 text-white rounded-lg">
        Go to Login
      </Link>
    </div>
  );
};

export default NotFound;