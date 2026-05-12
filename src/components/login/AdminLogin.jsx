import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/Interceptor';
import { END_POINTS } from '../../api/EndPoints';
import notify from '../utils/Notification';
import './AdminLogin.css';
import {
  IconLogin,
  IconUserPlus,
  IconShieldCheck,
  IconLock,
  IconUser,
  IconMail,
  IconPhone,
  IconCalendar,
  IconArrowLeft,
  IconRefresh,
  IconEye,
  IconEyeOff,
  IconChartBar,
  IconUsers,
  IconBuildingCommunity,
  IconSettings
} from '@tabler/icons-react';

const AdminLogin = () => {
  const [mode, setMode] = useState('login'); // 'login', 'signup', or 'forgot'
  const [loginType, setLoginType] = useState('password'); // 'password' or 'otp'
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset / Verify
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    mobileNumber: '',
    age: '',
    otp: '',
    loginId: ''
  });
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post(END_POINTS.AUTH_LOGIN, {
        username: formData.username,
        password: formData.password
      });
      const loginData = res.data.response;

      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData));

      if (loginData.isFirstLogin) {
        setTempUsername(loginData.username);
        setShowChangePassword(true);
      } else {
        if (loginData.role === 'ROLE_TENANT' || loginData.role === 'TENANT') {
          navigate('/tenant/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
      notify({
        title: 'Login Successful',
        message: `Welcome back, ${loginData.name || loginData.username}!`,
        success: true
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post(END_POINTS.AUTH_REGISTER, {
        ...formData,
        role: 'ADMIN'
      });
      notify({
        title: 'Registration Successful',
        message: 'Admin registered! Credentials sent to your email.',
        success: true
      });
      setMode('login');
      setFormData({ ...formData, password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { loginId: formData.loginId });
      setStep(2);
      setResendTimer(30);
      notify({
        title: 'OTP Sent',
        message: 'OTP sent to your registered email.',
        success: true
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        username: formData.loginId,
        otp: formData.otp,
        newPassword: passwords.newPassword
      });
      notify({
        title: 'Success',
        message: 'Password reset successful!',
        success: true
      });
      setMode('login');
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendLoginOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/send-login-otp', { loginId: formData.username });
      setStep(2);
      setResendTimer(30);
      notify({
        title: 'OTP Sent',
        message: 'Login OTP sent to your registered email/mobile.',
        success: true
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    try {
      setLoading(true);
      if (mode === 'forgot') {
        await api.post('/auth/forgot-password', { loginId: formData.loginId });
      } else {
        await api.post('/auth/send-login-otp', { loginId: formData.username });
      }
      setResendTimer(30);
      notify({
        title: 'OTP Resent',
        message: 'A new OTP has been sent successfully.',
        success: true
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-login-otp', {
        username: formData.username,
        otp: formData.otp
      });
      const loginData = res.data.response;

      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData));

      if (loginData.isFirstLogin) {
        setTempUsername(loginData.username);
        setShowChangePassword(true);
      } else {
        if (loginData.role === 'ROLE_TENANT' || loginData.role === 'TENANT') {
          navigate('/tenant/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
      notify({
        title: 'Login Successful',
        message: `Welcome back, ${loginData.name || loginData.username}!`,
        success: true
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    try {
      setLoading(true);
      await api.post('/auth/change-password', {
        username: tempUsername,
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      setShowChangePassword(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  if (showChangePassword) {
    return (
      <div className="admin-login-container">
        <div className="admin-right-section" style={{ flex: 1 }}>
          <div className="admin-login-card">
            <div className="admin-header">
              <div className="admin-logo-box">
                <IconShieldCheck size={32} />
              </div>
              <h2>Security Update</h2>
              <p>Please set a new password for your administrator account.</p>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handlePasswordChange}>
              <div className="admin-form-group">
                <label>Current Password</label>
                <div className="admin-input-wrapper">
                  <IconLock className="admin-input-icon" size={20} />
                  <input type={showPassword ? "text" : "password"} className="admin-input" required value={passwords.oldPassword} onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })} />
                  <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </div>
                </div>
              </div>
              <div className="admin-form-group">
                <label>New Password</label>
                <div className="admin-input-wrapper">
                  <IconLock className="admin-input-icon" size={20} />
                  <input type={showPassword ? "text" : "password"} className="admin-input" required value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Confirm New Password</label>
                <div className="admin-input-wrapper">
                  <IconLock className="admin-input-icon" size={20} />
                  <input type={showPassword ? "text" : "password"} className="admin-input" required value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="admin-btn" disabled={loading}>
                {loading ? 'Updating...' : 'Set New Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'forgot') {
    return (
      <div className="admin-login-container">
        <div className="admin-right-section" style={{ flex: 1 }}>
          <div className="admin-login-card">
            <div className="admin-header">
              <div className="admin-logo-box" onClick={() => { setMode('login'); setStep(1); }} style={{ cursor: 'pointer' }}>
                <IconArrowLeft size={24} />
              </div>
              <h2>{step === 1 ? 'Forgot Password' : 'Verify Identity'}</h2>
              <p>{step === 1 ? 'Enter your credentials to receive a recovery OTP.' : 'Check your email and enter the OTP below.'}</p>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            {step === 1 ? (
              <form onSubmit={handleForgotPassword}>
                <div className="admin-form-group">
                  <label>Admin ID / Email / Mobile</label>
                  <div className="admin-input-wrapper">
                    <IconUser className="admin-input-icon" size={20} />
                    <input className="admin-input" name="loginId" value={formData.loginId} onChange={handleInputChange} required placeholder="Enter login identity" />
                  </div>
                </div>
                <button type="submit" className="admin-btn" disabled={loading}>
                  {loading ? 'Processing...' : <><IconRefresh size={20} /> Send OTP</>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="admin-form-group">
                  <label>Verification OTP</label>
                  <div className="admin-input-wrapper">
                    <IconLock className="admin-input-icon" size={20} />
                    <input className="admin-input" name="otp" value={formData.otp} onChange={handleInputChange} required maxLength="6" />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label>New Secure Password</label>
                  <div className="admin-input-wrapper">
                    <IconLock className="admin-input-icon" size={20} />
                    <input type={showPassword ? "text" : "password"} className="admin-input" required value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} />
                    <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </div>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label>Confirm Password</label>
                  <div className="admin-input-wrapper">
                    <IconLock className="admin-input-icon" size={20} />
                    <input type={showPassword ? "text" : "password"} className="admin-input" required value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
                  </div>
                </div>
                <div className="resend-wrapper" style={{ marginTop: '10px', textAlign: 'right' }}>
                  {resendTimer > 0 ? (
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>Resend OTP in {resendTimer}s</span>
                  ) : (
                    <span onClick={handleResendOtp} style={{ fontSize: '0.85rem', color: 'var(--gold)', cursor: 'pointer', fontWeight: 'bold' }}>Resend OTP</span>
                  )}
                </div>
                <button type="submit" className="admin-btn" disabled={loading}>
                  {loading ? 'Resetting...' : 'Verify & Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-container">
      {/* Left Section - Hero */}
      <div className="admin-left-section">
        <img
          src="/home/ssb/.gemini/antigravity/brain/5e97ad27-685c-4b4f-8888-0975b7e27c5e/modern_luxury_apartment_lobby_1778490706486.png"
          alt="Admin Hero"
          className="admin-bg-image"
        />
        <div className="admin-left-overlay"></div>
        <div className="admin-left-content">
          <h1>Master Your <br /> Property Portfolio.</h1>
          <p>The ultimate luxury control center for premium property management. Monitor, automate, and scale with effortless precision.</p>

          <div className="admin-feature-grid">
            <div className="admin-feature-card">
              <IconChartBar size={24} color="var(--accent-gold)" />
              <h3>Real-time Analytics</h3>
              <p>Live occupancy & revenue tracking</p>
            </div>
            <div className="admin-feature-card">
              <IconUsers size={24} color="var(--accent-gold)" />
              <h3>Tenant Hub</h3>
              <p>Automated onboarding & logs</p>
            </div>
            <div className="admin-feature-card">
              <IconBuildingCommunity size={24} color="var(--accent-gold)" />
              <h3>Asset Management</h3>
              <p>Inventory & room control</p>
            </div>
            <div className="admin-feature-card">
              <IconSettings size={24} color="var(--accent-gold)" />
              <h3>Global Controls</h3>
              <p>Multi-property configuration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="admin-right-section">
        <div className="admin-login-card">
          <div className="admin-header">
            <div className="admin-logo-box">
              <IconBuildingCommunity size={32} />
            </div>
            <h2>Admin Portal</h2>
            <p>Experience YHOMEE property management.</p>
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setStep(1); }}>Sign In</button>
            <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setStep(1); }}>Sign Up</button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={
            mode === 'signup' ? handleRegister :
              loginType === 'password' ? handleLogin :
                (step === 1 ? handleSendLoginOtp : handleVerifyLoginOtp)
          }>
            <div className="admin-form-group">
              <label>Identity</label>
              <div className="admin-input-wrapper">
                <IconUser className="admin-input-icon" size={20} />
                <input className="admin-input" name="username" value={formData.username} onChange={handleInputChange} required placeholder="Email or Mobile" disabled={mode === 'login' && loginType === 'otp' && step === 2} />
              </div>
            </div>

            {mode === 'login' && (
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '0.9rem', color: 'var(--ink)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" checked={loginType === 'password'} onChange={() => { setLoginType('password'); setStep(1); setFormData(prev => ({...prev, password: '', otp: ''})); }} style={{ accentColor: 'var(--gold)' }} /> Password
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" checked={loginType === 'otp'} onChange={() => { setLoginType('otp'); setStep(1); setFormData(prev => ({...prev, password: '', otp: ''})); }} style={{ accentColor: 'var(--gold)' }} /> OTP
                </label>
              </div>
            )}

            {mode === 'signup' && (
              <>
                <div className="admin-form-group">
                  <label>Full Name</label>
                  <div className="admin-input-wrapper">
                    <IconUser className="admin-input-icon" size={20} />
                    <input className="admin-input" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label>Email Address</label>
                  <div className="admin-input-wrapper">
                    <IconMail className="admin-input-icon" size={20} />
                    <input type="email" className="admin-input" name="email" value={formData.email} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label>Mobile Number</label>
                  <div className="admin-input-wrapper">
                    <IconPhone className="admin-input-icon" size={20} />
                    <input className="admin-input" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label>Age</label>
                  <div className="admin-input-wrapper">
                    <IconCalendar className="admin-input-icon" size={20} />
                    <input type="number" className="admin-input" name="age" value={formData.age} onChange={handleInputChange} required />
                  </div>
                </div>
              </>
            )}
            {mode === 'login' && loginType === 'password' && (
              <>
                <div className="admin-form-group">
                  <label>Password</label>
                  <div className="admin-input-wrapper">
                    <IconLock className="admin-input-icon" size={20} />
                    <input type={showPassword ? "text" : "password"} className="admin-input" name="password" value={formData.password} onChange={handleInputChange} required placeholder="••••••••" />
                    <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </div>
                  </div>
                </div>
                <div className="forgot-password-link">
                  <span onClick={() => { setMode('forgot'); setStep(1); }}>Forgot Password?</span>
                </div>
              </>
            )}

            {mode === 'login' && loginType === 'otp' && step === 2 && (
              <>
                <div className="admin-form-group">
                  <label>Verification OTP</label>
                  <div className="admin-input-wrapper">
                    <IconLock className="admin-input-icon" size={20} />
                    <input className="admin-input" name="otp" value={formData.otp} onChange={handleInputChange} required maxLength="6" placeholder="Enter 6-digit OTP" />
                  </div>
                </div>
                <div className="resend-wrapper" style={{ marginTop: '-10px', marginBottom: '20px', textAlign: 'right' }}>
                  {resendTimer > 0 ? (
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>Resend OTP in {resendTimer}s</span>
                  ) : (
                    <span onClick={handleResendOtp} style={{ fontSize: '0.85rem', color: 'var(--gold)', cursor: 'pointer', fontWeight: 'bold' }}>Resend OTP</span>
                  )}
                </div>
              </>
            )}

            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? 'Processing...' : (
                mode === 'signup' ? <><IconUserPlus size={20} /> Create Admin</> :
                  loginType === 'password' ? <><IconLogin size={20} /> Sign In</> :
                    (step === 1 ? <><IconRefresh size={20} /> Send OTP</> : <><IconLogin size={20} /> Verify & Login</>)
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
