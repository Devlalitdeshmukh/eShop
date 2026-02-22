import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { useStore } from '../store';
import { UserRole } from '../types';

const Navbar = () => {
  const { cart, user, logout } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navClass = (path: string) => {
    const active = location.pathname === path;
    return active
      ? 'px-4 py-2 rounded-xl bg-brand-50 text-brand-700 font-semibold'
      : 'px-4 py-2 rounded-xl text-gray-700 hover:text-brand-600 hover:bg-gray-50 transition-colors';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold font-serif">D</div>
              <span className="font-serif font-bold text-xl text-gray-900">Desi Delights</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8"> 
            <Link to="/" className={navClass('/')}>Home</Link>
            <Link to="/about" className={navClass('/about')}>About</Link>
            <Link to="/shop" className={navClass('/shop')}>Shop</Link>
            <Link to="/contact" className={navClass('/contact')}>Contact</Link>
            {(user?.role === UserRole.ADMIN || user?.role === UserRole.STAFF || user?.role === UserRole.COMPANY) && (
              <Link to="/admin" className="text-brand-600 font-semibold">Admin Panel</Link>
            )}
            
            <Link to="/cart" className="relative text-gray-700 hover:text-brand-600">
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 group">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold overflow-hidden group-hover:ring-2 group-hover:ring-brand-500 transition-all">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-brand-600 transition-colors">Hi, {user.name.split(' ')[0]}</span>
                </Link>
                <button 
                  onClick={logout}
                  className="text-gray-500 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1 text-gray-700 hover:text-brand-600">
                <UserIcon className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">
            <Link to="/cart" className="relative text-gray-700">
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/shop" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600" onClick={() => setIsOpen(false)}>Shop</Link>
            <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600" onClick={() => setIsOpen(false)}>Contact</Link>
            {(user?.role === UserRole.ADMIN || user?.role === UserRole.STAFF || user?.role === UserRole.COMPANY) && (
              <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-brand-600 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Admin Panel</Link>
            )}
            {user ? (
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50">Logout</button>
            ) : (
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
