import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import axios from 'axios';

const CompanyLogin = () => {
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
  
  // Check for error parameter in URL
  useEffect(() => {
    if (router.query.error === 'not_approved') {
      setError('Your company account is pending approval by an administrator. Please check back later.');
    }
  }, [router.query]);

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

        const response = await axios.post('/api/companies?login=true', {
          email,
          password
        });

        // Store company data in localStorage
        localStorage.setItem('companyData', JSON.stringify(response.data));
        
        // Redirect to company dashboard
        router.push('/company-dashboard');
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

        const response = await axios.post('/api/companies?signup=true', {
          name,
          email,
          password,
          description,
          website,
          phone
        });

        // Show success message instead of redirecting
        setIsLogin(true);
        setError('');
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          description: '',
          website: '',
          phone: ''
        });
        
        // Display success message
        alert('Your company registration has been submitted and is pending approval. You will be notified once approved.');
      }
    } catch (error) {
      console.error('Company auth error:', error);
      if (error.response?.status === 403 && error.response?.data?.error === 'Company account pending approval') {
        setError('Your company account is pending approval by an administrator. Please check back later.');
      } else if (error.response?.status === 403 && error.response?.data?.error === 'Company account not approved') {
        setError('Your company account has not been approved. Please contact an administrator.');
      } else {
        setError(error.response?.data?.error || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-surface py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-background p-8 rounded-lg shadow-md border border-border">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-primary font-montserrat">
              {isLogin ? 'Company Login' : 'Company Registration'}
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-text-primary text-sm font-bold mb-2 font-montserrat" htmlFor="name">
                  Company Name
                </label>
                <input
                  className="shadow appearance-none border border-border rounded w-full py-2 px-3 text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-accent1 bg-background font-source-serif"
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Company Name"
                />
              </div>
            )}

            <div>
              <label className="block text-text-primary text-sm font-bold mb-2 font-montserrat" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border border-border rounded w-full py-2 px-3 text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-accent1 bg-background font-source-serif"
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
              />
            </div>

            <div>
              <label className="block text-text-primary text-sm font-bold mb-2 font-montserrat" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border border-border rounded w-full py-2 px-3 text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-accent1 bg-background font-source-serif"
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
                <div>
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

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Company Description
                  </label>
                  <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of your company"
                    rows="3"
                  />
                </div>

                <div>
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
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div>
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
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                className="bg-accent1 hover:bg-accent1-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-accent1-light font-montserrat"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
              </button>
              <button
                className="inline-block align-baseline font-bold text-sm text-accent1 hover:text-accent1-dark font-montserrat"
                type="button"
                onClick={toggleAuthMode}
              >
                {isLogin ? 'Need to register?' : 'Already have an account?'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CompanyLogin;