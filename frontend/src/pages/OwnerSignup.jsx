import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UtensilsCrossed, UserPlus } from 'lucide-react';

const OwnerSignup = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:5000/api';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
        setError('Please fill in all required fields.');
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/owners/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Account created successfully! You can now log in.');
        navigate('/owner-login');
      } else {
        setError(data.message || 'Signup failed. The email might already be in use.');
      }
    } catch (err) {
      console.error('Signup error:', err);
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
          <h2 className="text-2xl font-semibold text-gray-700">Create Owner Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="first_name" placeholder="First Name" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"/>
            <input type="text" name="last_name" placeholder="Last Name" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"/>
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <input
              type="tel"
              name="phone_number"
              placeholder="Phone Number (Optional)"
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
            <UserPlus size={20} />
            Create Account
          </button>

          <div className="text-center text-sm">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/owner-login" className="font-medium text-orange-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerSignup;