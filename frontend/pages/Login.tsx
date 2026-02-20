import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { UserRole } from '../types';

const Login = () => {
  const { login, user } = useStore();
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Effect to handle redirection after login
  useEffect(() => {
    // Only redirect if user exists and we're still on the login page
    if (user && location.pathname === '/login') {
      if (user.role === UserRole.ADMIN) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate, location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Call login with email and password only
      await login(email, password);
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold font-serif text-xl mx-auto mb-4">D</div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500">Sign in to access your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none" 
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none" 
              placeholder="Password"
            />
          </div>
          
          {/* Removed role selection - actual role will be determined from backend */}
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full ${loading ? 'bg-brand-400' : 'bg-brand-600'} text-white py-3 rounded-lg font-bold hover:${loading ? 'bg-brand-400' : 'bg-brand-700'} transition-colors`}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-brand-600 hover:text-brand-500">
              Sign up
            </Link>
          </p>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>For demo purposes, enter any email. Password is not required.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;