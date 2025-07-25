import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AvatarFallback = ({ name }) => {
  const initials = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
      {initials}
    </div>
  );
};

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${hasScrolled ? 'bg-surface/80 backdrop-blur-lg shadow-md' : 'bg-transparent'}`}>
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">JobPortal</Link>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-text-secondary">
          {(!isAuthenticated || user?.role === 'Job Seeker') && (
            <NavLink to="/jobs" className={({ isActive }) => isActive ? "text-primary" : "hover:text-primary"}>Find Jobs</NavLink>
          )}
          {isAuthenticated && user?.role === 'Job Seeker' && (
            <>
              <NavLink to="/my-applications" className={({ isActive }) => isActive ? "text-primary" : "hover:text-primary"}>My Applications</NavLink>
              <NavLink to="/tools/resume-analyzer" className={({ isActive }) => isActive ? "text-primary" : "hover:text-primary"}>Resume Analyzer</NavLink>
            </>
          )}
          {isAuthenticated && user?.role === 'Employer' && (
            <NavLink to="/employer/dashboard" className={({ isActive }) => isActive ? "text-primary" : "hover:text-primary"}>Dashboard</NavLink>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <>
              {user?.role === 'Employer' && (
                <Link to="/post-job" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center gap-2">
                  <PlusCircle size={16} /> Post Job
                </Link>
              )}
              <Link to="/profile" title="View Profile"><AvatarFallback name={user.first_name} /></Link>
              <button onClick={handleLogout} title="Logout" className="p-2 rounded-full hover:bg-gray-100"><LogOut className="h-5 w-5 text-red-500" /></button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-primary">Log In</Link>
              <Link to="/signup" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};