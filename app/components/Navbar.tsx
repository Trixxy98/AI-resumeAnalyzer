
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
      <div className="navbar-inner">
        <Link to="/">
          <p className='text-2xl font-bold text-gradient'>RESUMAI</p>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-slate-600 md:inline">
                Hi, {user.firstName || user.email}
              </span>
              <Link to="/upload" className='primary-button w-fit'>
                Upload Resume
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
      </div>
    </nav>
  );
};

export default Navbar;