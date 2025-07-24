import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-secondary mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-text-secondary">
        <p>&copy; {new Date().getFullYear()} JobPortal. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <Link to="/about" className="hover:text-primary">About</Link>
          <Link to="/contact" className="hover:text-primary">Contact</Link>
          <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
};