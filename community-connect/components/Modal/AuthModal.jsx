import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import SafetyInfoModal from '../Safety/SafetyInfoModal';

// Organized dorm data with cascading structure
const DORM_DATA = {
  "Away From Campus": ["Upland (abroad)"],
  "Bergwall Hall": ["1st Bergwall", "2nd Bergwall", "3rd Bergwall", "4th Bergwall"],
  "Breuninger Hall": ["1st Breuninger", "2nd Breuninger", "3rd Breuninger"],
  "Brolund Hall": ["Residential Village Wing 6"],
  "Campbell Hall": ["Univ Apts-Campbell Hall-1st Fl", "Univ Apts-Campbell Hall-2nd Fl"],
  "Chiu Hall": ["Residential Village Wing 1"],
  "Commuter": ["Commuter Married", "Commuter Single"],
  "Corner House": ["Corner House Wing"],
  "Delta Apts": ["Delta Wing"],
  "English Hall": [
    "1st North English", "1st South English", "2nd Center English", 
    "2nd North English", "2nd South English", "3rd Center English", 
    "3rd North English", "3rd South English", "English Hall - Cellar"
  ],
  "Flanigan Hall": ["Residential Village Wing 3"],
  "Gerig Hall": ["2nd Gerig", "3rd Gerig", "4th Gerig"],
  "Gygi Hall": ["Residential Village Wing 2"],
  "Haven on 2nd": ["Second South Street", "West Spencer Avenue"],
  "Jacobsen Hall": ["Residential Village Wing 7"],
  "Kerlin Hall": ["Residential Village Wing 5"],
  "Off-Campus Housing": [],
  "Olson Hall": [
    "1st East Olson", "1st West Olson", "2nd Center Olson", 
    "2nd East Olson", "2nd West Olson", "3rd Center Olson", 
    "3rd East Olson", "3rd West Olson"
  ],
  "Robbins Hall": ["Residential Village Wing 4"],
  "Sammy Morris Hall": [
    "1st Morris Center", "1st Morris North", "1st Morris South", 
    "2nd Morris Center", "2nd Morris North", "2nd Morris South", 
    "3rd Morris Center", "3rd Morris North", "3rd Morris South", 
    "4th Morris Center", "4th Morris North", "4th Morris South"
  ],
  "Swallow Robin Hall": ["1st Swallow", "2nd Swallow", "3rd Swallow"],
  "The Flats Apartments": ["Casa Wing"],
  "Wengatz Hall": [
    "1st East Wengatz", "1st West Wengatz", "2nd Center Wengatz", 
    "2nd East Wengatz", "2nd West Wengatz", "3rd Center Wengatz", 
    "3rd East Wengatz", "3rd West Wengatz"
  ],
  "Wolgemuth Hall": [
    "Univ Apt-Wolgemuth Hall-1st Fl", "Univ Apt-Wolgemuth Hall-2nd Fl", 
    "Univ Apt-Wolgemuth Hall-3rd Fl"
  ]
};

const AuthModal = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dorm: '',
    wing: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [pendingMessage, setPendingMessage] = useState('');

  // State for Taylor Email Verification
  const [showTaylorVerificationInput, setShowTaylorVerificationInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [taylorUserEmail, setTaylorUserEmail] = useState('');

  // State for Password Reset
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordResetEmail, setPasswordResetEmail] = useState('');
  const [showPasswordResetVerification, setShowPasswordResetVerification] = useState(false);
  const [passwordResetCode, setPasswordResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // State for blocked status
  const [isBlocked, setIsBlocked] = useState(false);
  
  // State for safety modal
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [safetyContent, setSafetyContent] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Reset wing selection when dorm changes
      if (name === 'dorm') {
        newData.wing = '';
      }
      return newData;
    });
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setPendingMessage('');
    // Reset Taylor verification state if mode is toggled
    setShowTaylorVerificationInput(false);
    setVerificationCode('');
    setTaylorUserEmail('');
    // Reset password reset state
    setShowPasswordReset(false);
    setShowPasswordResetVerification(false);
    setPasswordResetEmail('');
    setPasswordResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setPendingMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: passwordResetEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset code');
      }

      setShowPasswordReset(false);
      setShowPasswordResetVerification(true);
      setPendingMessage(data.message || 'Password reset code sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setPendingMessage('');
    setIsSubmitting(true);

    // Validate passwords match
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: passwordResetEmail,
          verificationCode: passwordResetCode,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      // Reset successful - show success message and switch to login
      setPendingMessage(data.message || 'Password reset successful! You can now log in.');
      setShowPasswordResetVerification(false);
      setShowPasswordReset(false);
      setIsLogin(true);
      // Clear password reset data
      setPasswordResetEmail('');
      setPasswordResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    setShowPasswordReset(false);
    setShowPasswordResetVerification(false);
    setError('');
    setPendingMessage('');
    setPasswordResetEmail('');
    setPasswordResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPendingMessage('');
    
    // For signup, show safety modal first
    if (!isLogin) {
      // Fetch safety content
      try {
        const response = await fetch('/api/content');
        if (response.ok) {
          const content = await response.json();
          setSafetyContent(content);
          setShowSafetyModal(true);
        } else {
          // If content fetch fails, proceed without safety modal
          await performSignup();
        }
      } catch (error) {
        console.error('Error fetching safety content:', error);
        // If content fetch fails, proceed without safety modal
        await performSignup();
      }
      return;
    }
    
    // For login, proceed normally
    await performLogin();
  };

  const performSignup = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users?signup=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.blocked) {
        setIsBlocked(true);
        setPendingMessage('Your account has been created and is pending admin approval. You will be notified when your account is approved.');
        setFormData({ name: '', email: '', password: '', dorm: '', wing: '' });
        setIsSubmitting(false);
        return;
      }

      // Handle Taylor email verification step
      if (response.status === 202 && data.requiresTaylorVerification) {
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
        setFormData({ name: '', email: '', password: '', dorm: '', wing: '' });
      } else {
        onSuccess(data);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const performLogin = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users?login=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSafetyAcknowledge = async () => {
    setShowSafetyModal(false);
    await performSignup();
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

  // Get available wings for selected dorm
  const getAvailableWings = () => {
    if (!formData.dorm || !DORM_DATA[formData.dorm]) return [];
    return DORM_DATA[formData.dorm];
  };

  return (
    <>
      <div className="px-6 pt-6 flex justify-between items-center">
        <h2 className="font-montserrat text-2xl font-bold text-primary m-0">
          {showPasswordReset ? 'Reset Password' : 
           showPasswordResetVerification ? 'Enter Reset Code' :
           showTaylorVerificationInput ? 'Verify Email' :
           isLogin ? 'Log In' : 'Sign Up'}
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
                  {showTaylorVerificationInput ? "Verify Your Email" : (isLogin && isBlocked ? "Account Blocked" : "Account Pending Approval")}
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
        ) : showPasswordReset ? (
          // Password Reset Email Input Form
          <form onSubmit={handleForgotPassword} className="animate-fadeIn">
            <div className="mb-4">
              <label htmlFor="passwordResetEmail" className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
                Email Address
              </label>
              <Input
                type="email"
                id="passwordResetEmail"
                name="passwordResetEmail"
                value={passwordResetEmail}
                onChange={(e) => setPasswordResetEmail(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Enter your email address"
              />
              <p className="text-xs text-text-secondary mt-1">
                We&apos;ll send a verification code to reset your password.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                variant="secondary"
                className="w-full py-3 rounded-md"
                disabled={isSubmitting || !passwordResetEmail}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Code'
                )}
              </Button>
              <button
                type="button"
                className="text-center text-sm text-accent1 hover:text-primary font-medium focus:outline-none py-2"
                onClick={handleBackToLogin}
                disabled={isSubmitting}
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : showPasswordResetVerification ? (
          // Password Reset Verification Form
          <form onSubmit={handlePasswordReset} className="animate-fadeIn">
            <div className="mb-4">
              <label htmlFor="passwordResetCode" className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
                Verification Code
              </label>
              <Input
                type="text"
                id="passwordResetCode"
                name="passwordResetCode"
                value={passwordResetCode}
                onChange={(e) => setPasswordResetCode(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
              <p className="text-xs text-text-secondary mt-1">
                A code was sent to: <strong>{passwordResetEmail}</strong>
              </p>
            </div>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
                New Password
              </label>
              <Input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Enter new password"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="confirmNewPassword" className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
                Confirm New Password
              </label>
              <Input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                variant="secondary"
                className="w-full py-3 rounded-md"
                disabled={isSubmitting || passwordResetCode.length !== 6 || !newPassword || !confirmNewPassword}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </Button>
              <button
                type="button"
                className="text-center text-sm text-accent1 hover:text-primary font-medium focus:outline-none py-2"
                onClick={handleBackToLogin}
                disabled={isSubmitting}
              >
                Back to Login
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
                Select Your Wing/Floor (optional)
              </label>
              <select
                id="dorm"
                name="dorm"
                value={formData.dorm}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent1 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">Choose your dorm/building...</option>
                {Object.keys(DORM_DATA).sort().map((dorm) => (
                  <option key={dorm} value={dorm}>
                    {dorm}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!isLogin && formData.dorm && getAvailableWings().length > 0 && (
            <div className="mb-4 animate-slideUp" style={{ animationDelay: '50ms' }}>
              <label htmlFor="wing" className="block font-montserrat font-semibold text-sm text-text-primary mb-2">
                Select Your Specific Wing/Floor
              </label>
              <select
                id="wing"
                name="wing"
                value={formData.wing}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent1 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">Choose your wing/floor...</option>
                {getAvailableWings().map((wing) => (
                  <option key={wing} value={wing}>
                    {wing}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4 animate-slideUp" style={{ animationDelay: '75ms' }}>
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
            {isLogin && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  className="text-sm text-accent1 hover:text-primary font-medium focus:outline-none"
                  onClick={() => {
                    setShowPasswordReset(true);
                    setPasswordResetEmail(formData.email);
                  }}
                  disabled={isSubmitting}
                >
                  Forgot Password?
                </button>
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
                disabled={isSubmitting || showTaylorVerificationInput || showPasswordReset || showPasswordResetVerification} // Disable toggle when verification or password reset is shown
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </div>
          </div>
        </form>
        )}
      </div>
      
      {/* Safety Information Modal */}
      <SafetyInfoModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        onAcknowledge={handleSafetyAcknowledge}
        type="user"
        content={safetyContent}
      />
    </>
  );
};

export default AuthModal;