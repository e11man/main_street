import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

const AuthModal = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const [pendingMessage, setPendingMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPendingMessage('');
    setIsSubmitting(true);

    try {
      // Determine endpoint based on auth mode
      const endpoint = isLogin ? '/api/users?login=true' : '/api/users?signup=true';
      
      // Make API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      // Handle blocked users with a generic message that doesn't reveal they're blocked
      if (data.blocked) {
        // Use the same message as pending to avoid revealing the block status
        setPendingMessage('Your account has been created and is pending admin approval. You will be notified when your account is approved.');
        if (!isLogin) {
          setFormData({
            name: '',
            email: '',
            password: ''
          });
        }
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Check if this is a pending signup
      if (response.status === 202 && data.pending) {
        setPendingMessage(data.message || 'Your account has been created and is pending admin approval. You will be notified when your account is approved.');
        // Clear form data for signup but keep the modal open
        if (!isLogin) {
          setFormData({
            name: '',
            email: '',
            password: ''
          });
        }
      } else {
        // Success - call the onSuccess callback with user data
        onSuccess(data);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="px-6 pt-6 flex justify-between items-center">
        <h2 className="font-montserrat text-2xl font-bold text-primary m-0">
          {isLogin ? 'Log In' : 'Sign Up'}
        </h2>
        <button
          className="bg-none border-none text-2xl cursor-pointer text-text-secondary p-2 rounded-md transition-all duration-200 hover:bg-surface hover:text-text-primary"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {pendingMessage && (
          <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-400 text-yellow-800 rounded-md text-sm font-medium">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold mb-1">Account Pending Approval</p>
                <p>{pendingMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4 animate-slideUp">
              <label htmlFor="name" className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
                Full Name *
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="mb-4 animate-slideUp" style={{ animationDelay: '50ms' }}>
            <label htmlFor="email" className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
              Email Address *
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-6 animate-slideUp" style={{ animationDelay: '100ms' }}>
            <label htmlFor="password" className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
              Password *
            </label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-3 animate-slideUp" style={{ animationDelay: '150ms' }}>
            <Button 
              type="submit" 
              variant="secondary" 
              className="w-full py-3 rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Logging in...' : 'Signing up...'}
                </span>
              ) : (
                <>{isLogin ? 'Log In' : 'Sign Up'}</>
              )}
            </Button>
            
            <div className="text-center text-sm text-text-secondary">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                type="button"
                className="ml-1 text-accent1 hover:text-primary font-medium focus:outline-none"
                onClick={toggleAuthMode}
                disabled={isSubmitting}
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default AuthModal;