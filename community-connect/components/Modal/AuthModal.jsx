import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

const AuthModal = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dorm: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pendingMessage, setPendingMessage] = useState('');

  // State for Taylor Email Verification
  const [showTaylorVerificationInput, setShowTaylorVerificationInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [taylorUserEmail, setTaylorUserEmail] = useState('');


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    // Reset Taylor verification state if mode is toggled
    setShowTaylorVerificationInput(false);
    setVerificationCode('');
    // Keep taylorUserEmail as it might be needed if user toggles back and forth,
    // or reset it based on desired UX. For now, let's reset it.
    setTaylorUserEmail('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPendingMessage('');
    setIsSubmitting(true);

    try {
      const endpoint = isLogin ? '/api/users?login=true' : '/api/users?signup=true';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.blocked) {
        setPendingMessage('Your account has been created and is pending admin approval. You will be notified when your account is approved.');
        if (!isLogin) setFormData({ name: '', email: '', password: '' });
        setIsSubmitting(false);
        return;
      }

      // Handle Taylor email verification step
      if (!isLogin && response.status === 202 && data.requiresTaylorVerification) {
        setTaylorUserEmail(formData.email);
        setShowTaylorVerificationInput(true);
        setPendingMessage(data.message || 'Please check your email for a verification code.');
        setFormData(prev => ({ ...prev, password: '' })); // Clear password
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (response.status === 202 && data.pending) {
        setPendingMessage(data.message || 'Your account is pending admin approval.');
        if (!isLogin) setFormData({ name: '', email: '', password: '' });
      } else {
        // Store user data in localStorage
        localStorage.setItem('userData', JSON.stringify(data));
        // Trigger custom event for header update
        window.dispatchEvent(new Event('userLogin'));
        onSuccess(data);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaylorVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPendingMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/users?verifyTaylorEmail=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: taylorUserEmail, verificationCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Verification successful
      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify(data));
      // Trigger custom event for header update
      window.dispatchEvent(new Event('userLogin'));
      onSuccess(data);
      onClose();
      // Reset Taylor specific states
      setShowTaylorVerificationInput(false);
      setVerificationCode('');
      setTaylorUserEmail('');

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
          disabled={isSubmitting} // Prevent closing while any submission is in progress
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
        
        {/* Updated Pending Message Block */}
        {pendingMessage && (
          <div className={`mb-4 p-4 border-2 rounded-md text-sm font-medium ${showTaylorVerificationInput ? 'bg-blue-50 border-blue-400 text-blue-800' : 'bg-yellow-50 border-yellow-400 text-yellow-800'}`}>
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 mt-0.5 ${showTaylorVerificationInput ? 'text-blue-600' : 'text-yellow-600'}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold mb-1">
                  {showTaylorVerificationInput ? "Verify Your Email" : (isLogin && data.blocked ? "Account Blocked" : "Account Pending Approval")}
                </p>
                <p>{pendingMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {showTaylorVerificationInput ? (
          // Taylor Verification Code Input Form
          <form onSubmit={handleTaylorVerifySubmit} className="animate-fadeIn">
            <div className="mb-4">
              <label htmlFor="verificationCode" className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
                Verification Code
              </label>
              <Input
                type="text"
                id="verificationCode"
                name="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
               <p className="text-xs text-text-secondary mt-1">
                A code was sent to: <strong>{taylorUserEmail}</strong>
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                variant="secondary"
                className="w-full py-3 rounded-md"
                disabled={isSubmitting || verificationCode.length !== 6}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify & Sign Up'
                )}
              </Button>
              <button
                type="button"
                className="text-center text-sm text-accent1 hover:text-primary font-medium focus:outline-none py-2"
                onClick={() => {
                  setShowTaylorVerificationInput(false);
                  // Keep pending message if it was about general pending, clear if it was about verification
                  // For simplicity now, just clear. Or set a specific "going back" message.
                  setPendingMessage('');
                  setError('');
                  // Retain formData.name and taylorUserEmail (which is formData.email), clear password
                  setFormData(prev => ({ ...prev, email: taylorUserEmail, password: ''}));
                }}
                disabled={isSubmitting}
              >
                Back to Sign Up Form
              </button>
            </div>
          </form>
        ) : (
          // Original Login/Signup Form
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

          {!isLogin && (
            <div className="mb-4 animate-slideUp" style={{ animationDelay: '25ms' }}>
              <label htmlFor="dorm" className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
                Select Your Dorm *
              </label>
              <select
                id="dorm"
                name="dorm"
                value={formData.dorm}
                onChange={handleChange}
                required={!isLogin}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent1 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">Choose your dorm...</option>
                <option value="Berg">Berg</option>
                <option value="Sammy">Sammy</option>
                <option value="Wengatz">Wengatz</option>
                <option value="Olson">Olson</option>
                <option value="English">English</option>
                <option value="Brue">Brue</option>
              </select>
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
            {/* Taylor email password warning - always visible on signup, highlighted if Taylor email */}
            {!isLogin && (
              <div className={`mt-2 p-2 rounded text-xs font-bold animate-fadeIn transition-all duration-200 
                ${/^[^@\s]+@taylor\.edu$/i.test(formData.email) 
                  ? 'bg-red-50 border border-red-400 text-red-700' 
                  : 'bg-gray-50 border border-gray-200 text-gray-400'}`}
              >
                Do <span className="underline">NOT</span> use the same password as your Taylor account!
              </div>
            )}
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
                disabled={isSubmitting || showTaylorVerificationInput} // Disable toggle when verification is shown
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </div>
          </div>
        </form>
        )}
      </div>
    </>
  );
};

export default AuthModal;