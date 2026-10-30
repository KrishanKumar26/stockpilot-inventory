import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, KeyRound, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

const AuthModal = ({ isOpen, onClose, initialView = 'login', onAuthSuccess }) => {
  const [view, setView] = useState(initialView); // 'login' | 'register' | 'otp' | 'forgot' | 'reset'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('manager');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setError('');
    setSuccessMsg('');
    setPassword('');
    setOtp('');
    setNewPassword('');
  };

  const handleSwitchView = (newView) => {
    resetForm();
    setView(newView);
  };

  // 1. Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success) {
        localStorage.setItem('shopai_token', res.token);
        localStorage.setItem('shopai_user', JSON.stringify(res.user));
        onAuthSuccess(res.user);
        onClose();
      } else if (res.needsVerification) {
        setDemoOtp(res.otp);
        setView('otp');
        setSuccessMsg(res.message);
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register(name, email, password, role);
      if (res.success) {
        setDemoOtp(res.otp);
        setView('otp');
        setSuccessMsg(res.message);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyOTP(email, otp.trim());
      if (res.success) {
        localStorage.setItem('shopai_token', res.token);
        localStorage.setItem('shopai_user', JSON.stringify(res.user));
        onAuthSuccess(res.user);
        onClose();
      } else {
        setError(res.message || 'OTP verification failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Resend OTP
  const handleResendOtp = async () => {
    setError('');
    try {
      const res = await api.resendOTP(email);
      if (res.success) {
        setDemoOtp(res.otp);
        setSuccessMsg('New OTP dispatched!');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  // 5. Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      if (res.success) {
        setDemoOtp(res.otp);
        setView('reset');
        setSuccessMsg(res.message);
      } else {
        setError(res.message || 'Failed to request reset OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword(email, otp.trim(), newPassword);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          setView('login');
          resetForm();
        }, 1500);
      } else {
        setError(res.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login Helper
  const fillDemo = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Password123');
    setError('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-logo" style={{ width: '32px', height: '32px', fontSize: '11px' }}>
              <span>AI</span>
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '18px' }}>
                {view === 'login' && 'Sign in to ShopAI'}
                {view === 'register' && 'Create Your Account'}
                {view === 'otp' && 'Verify 6-Digit OTP'}
                {view === 'forgot' && 'Reset Your Password'}
                {view === 'reset' && 'Set New Password'}
              </h2>
              <p style={{ fontSize: '12px', color: '#8e9bb2' }}>
                {view === 'login' && 'Enter your credentials to access the inventory system'}
                {view === 'register' && 'Join ShopAI intelligent inventory management'}
                {view === 'otp' && `Enter the OTP sent to ${email}`}
                {view === 'forgot' && "We'll send a 6-digit OTP to reset your password"}
                {view === 'reset' && 'Create a secure new password (min. 8 characters)'}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Demo OTP Banner for Easy Testing */}
        {demoOtp && (view === 'otp' || view === 'reset') && (
          <div
            style={{
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '12.5px',
              color: '#93c5fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>
              🔑 Demo Code: <strong>{demoOtp}</strong>
            </span>
            <button
              type="button"
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
              onClick={() => setOtp(demoOtp)}
            >
              Auto-fill OTP
            </button>
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px'
            }}
          >
            {error}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px'
            }}
          >
            {successMsg}
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {view === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: '#64748b' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="admin@shopai.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password (min 8 chars)</label>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11.5px', cursor: 'pointer' }}
                  onClick={() => handleSwitchView('forgot')}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: '#64748b' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  style={{ position: 'absolute', right: '12px', top: '11px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && password.length < 8 && (
                <span style={{ fontSize: '11px', color: '#f87171', marginTop: '4px', display: 'block' }}>
                  ⚠️ Minimum 8 characters required ({password.length}/8)
                </span>
              )}
            </div>

            {/* Quick Demo Login Credentials */}
            <div style={{ margin: '14px 0', padding: '10px 12px', background: '#0b101c', borderRadius: '8px', border: '1px solid #1a253c' }}>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                ⚡ Quick Demo Credentials (Password: <code>Password123</code>):
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '11px', flex: 1 }}
                  onClick={() => fillDemo('admin@shopai.com', 'admin')}
                >
                  👤 Admin
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '11px', flex: 1 }}
                  onClick={() => fillDemo('manager@shopai.com', 'manager')}
                >
                  💼 Manager
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12.5px', color: '#8e9bb2' }}>
              Don't have an account?{' '}
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => handleSwitchView('register')}
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {view === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: '#64748b' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: '#64748b' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="sarah@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="manager">Inventory Manager</option>
                  <option value="staff">Operations Staff</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Password * (min 8 chars)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    style={{ position: 'absolute', right: '10px', top: '11px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: password.length >= 8 ? '#10b981' : '#8e9bb2', marginBottom: '14px' }}>
              ✓ Must be at least 8 characters long ({password.length}/8)
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account & Get OTP'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12.5px', color: '#8e9bb2' }}>
              Already have an account?{' '}
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => handleSwitchView('login')}
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* 3. OTP VERIFICATION FORM */}
        {view === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label className="form-label">Enter 6-Digit Verification Code</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: '#64748b' }} />
                <input
                  type="text"
                  maxLength={6}
                  className="form-input"
                  style={{ paddingLeft: '40px', letterSpacing: '8px', fontSize: '18px', fontWeight: 700, textAlign: 'center' }}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP & Enter App'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '12px' }}>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }}
                onClick={handleResendOtp}
              >
                Didn't receive code? Resend OTP
              </button>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#8e9bb2', cursor: 'pointer' }}
                onClick={() => handleSwitchView('login')}
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* 4. FORGOT PASSWORD FORM */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label className="form-label">Your Registered Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: '#64748b' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send Password Reset OTP'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12.5px' }}>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#8e9bb2', cursor: 'pointer' }}
                onClick={() => handleSwitchView('login')}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* 5. RESET PASSWORD FORM */}
        {view === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">6-Digit OTP Code</label>
              <input
                type="text"
                maxLength={6}
                className="form-input"
                style={{ letterSpacing: '4px', textAlign: 'center', fontWeight: 700 }}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password (must be at least 8 characters)</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
              <span style={{ fontSize: '11px', color: newPassword.length >= 8 ? '#10b981' : '#8e9bb2', marginTop: '4px', display: 'block' }}>
                ✓ Minimum 8 characters ({newPassword.length}/8)
              </span>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Resetting Password...' : 'Confirm New Password'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12.5px' }}>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#8e9bb2', cursor: 'pointer' }}
                onClick={() => handleSwitchView('login')}
              >
                Cancel & Return to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
