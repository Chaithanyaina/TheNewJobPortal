import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="text-center">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      <h2 className="text-3xl font-semibold mt-4">Page Not Found</h2>
      <p className="text-text-secondary mt-2">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="mt-6 inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors">
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;