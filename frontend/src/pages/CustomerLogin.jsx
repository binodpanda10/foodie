import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UtensilsCrossed, LogIn } from 'lucide-react';

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:5000/api';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/customers/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store customer data in localStorage
        localStorage.setItem('customerData', JSON.stringify({ 
          customer_id: data.customer_id,
        }));
        
        // Navigate to the homepage
        navigate('/');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <UtensilsCrossed size={40} className="text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-800">Foodie</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700">Customer Login</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
            <LogIn size={20} />
            Sign In
          </button>
          <div className="text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-orange-600 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerLogin;