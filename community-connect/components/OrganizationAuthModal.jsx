import React, { useState, useEffect } from 'react';
import Modal from './Modal/Modal.jsx';
import axios from 'axios';
import { useRouter } from 'next/router';

const OrganizationAuthModal = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    description: '',
    website: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Reset form when component mounts
    setError('');
    setLoading(false);
    
    // Return cleanup function
    return () => {
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        description: '',
        website: '',
        phone: ''
      });
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Handle login
        const { email, password } = formData;
        if (!email || !password) {
          setError('Email and password are required');
          setLoading(false);
          return;
        }

        const response = await axios.post('/api/organizations?login=true', {
          email,
          password
        });

        // Store organization data in localStorage
        localStorage.setItem('organizationData', JSON.stringify(response.data));
        
        // Call onSuccess callback
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        // Redirect to organization dashboard
        router.push('/organization-dashboard');
      } else {
        // Handle signup
        const { name, email, password, confirmPassword, description, website, phone } = formData;
        
        // Validate input
        if (!name || !email || !password) {
          setError('Name, email, and password are required');
          setLoading(false);
          return;
        }
        
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const response = await axios.post('/api/organizations?signup=true', {
          name,
          email,
          password,
          description,
          website,
          phone
        });

        // Store organization data in localStorage
        localStorage.setItem('organizationData', JSON.stringify(response.data));
        
        // Call onSuccess callback
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        // Redirect to organization dashboard
        router.push('/organization-dashboard');
      }

      // Close modal after successful login/signup
      onClose();
    } catch (error) {
      console.error('Organization auth error:', error);
      setError(error.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <Modal onClose={onClose} title={isLogin ? 'Organization Login' : 'Organization Registration'}>
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Organization Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Organization Name"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
            />
          </div>

          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Organization Description
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of your organization"
                  rows="3"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="website">
                  Website (Optional)
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="website"
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourorganization.com"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                  Phone Number (Optional)
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                />
              </div>
            </>
          )}

          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
            </button>
            <button
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              type="button"
              onClick={toggleAuthMode}
            >
              {isLogin ? 'Need to register?' : 'Already have an account?'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default OrganizationAuthModal;