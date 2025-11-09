
import React from 'react';
import { Link } from 'react-router';
import { useAuth } from '~/lib/auth-context';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className='navbar'>
      <Link to="/">
        <p className='text-2xl font-bold text-gradient'>RESUMAI</p>
      </Link>
      
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-gray-700">
              Welcome, {user.firstName || user.email}
            </span>
            <Link to="/upload" className='primary-button w-fit'>
              Upload Resume
            </Link>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth" className='primary-button w-fit'>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;