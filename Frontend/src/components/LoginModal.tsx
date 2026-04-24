import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Loader2, Phone, Calendar, Users } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: any) => void;
  message?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess, message }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [otpStep, setOtpStep] = useState(false);

  // Form fields
  const [identifier, setIdentifier] = useState(''); // For login (email or phone)
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const [otpRequests, setOtpRequests] = useState(0);
  const [lastOtpRequest, setLastOtpRequest] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Auto-focus OTP input when step changes
  useEffect(() => {
    if (otpStep && isOpen) {
      setTimeout(() => {
        const otpInput = document.querySelector('input[placeholder="000000"]') as HTMLInputElement;
        if (otpInput) otpInput.focus();
      }, 100);
    }
  }, [otpStep, isOpen]);

  const resetForm = () => {
    setIdentifier('');
    setEmail('');
    setPhone('');
    setCountryCode('+91');
    setPassword('');
    setName('');
    setSurname('');
    setAge('');
    setGender('');
    setOtp('');
    setDevOtp('');
    setError('');
    setSuccess('');
    setIsLogin(true);
    setOtpStep(false);
    setResendCooldown(0);
    setOtpRequests(0);
    setLastOtpRequest(0);
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned;
    }
    return cleaned.slice(0, 10);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 1) return { text: 'Weak', color: 'text-red-500' };
    if (strength <= 3) return { text: 'Medium', color: 'text-yellow-500' };
    return { text: 'Strong', color: 'text-green-500' };
  };

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const normalizePhoneNumber = (value: string, countryCode?: string) => {
    const raw = String(value).trim();
    if (!raw) return "";

    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) return "";
    if (raw.startsWith("+")) return `+${cleaned}`;

    let normalized = cleaned.replace(/^0+/, "");
    if (countryCode) {
      const codeDigits = String(countryCode).replace(/\D/g, "");
      if (codeDigits && !normalized.startsWith(codeDigits)) {
        normalized = `${codeDigits}${normalized}`;
      }
      return `+${normalized}`;
    }

    if (normalized.length === 10) return `+91${normalized}`;
    return `+${normalized}`;
  };

  const handleOtpChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setOtp(cleaned);
    if (cleaned.length === 6 && otpStep) {
      // Auto-submit when 6 digits entered
      setTimeout(() => {
        if (isLogin && isOtpLogin) {
          handleLoginWithOtp();
        } else if (!isLogin && otpStep) {
          handleRegister();
        }
      }, 500);
    }
  };

  const parseJsonResponse = async (res: Response) => {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return { message: text || res.statusText };
    }
  };

  const handleSendOtp = async () => {
    const now = Date.now();
    if (now - lastOtpRequest < 60000) { // 1 minute cooldown
      setError('Please wait before requesting another OTP');
      return;
    }
    if (otpRequests >= 3) {
      setError('Too many OTP requests. Please try again later.');
      return;
    }

    if (!phone) {
      setError('Please enter a phone number');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phone, countryCode);
    if (!normalizedPhone) {
      setError('Invalid phone number format');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, countryCode }),
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data?.message || 'Failed to send OTP');
      setOtpStep(true);
      setResendCooldown(60); // 60 second cooldown
      setOtp(''); // Clear previous OTP
      setOtpRequests(prev => prev + 1);
      setLastOtpRequest(Date.now());
      setSuccess('OTP sent successfully! Check your phone.');
      if (data?.otp) {
        setDevOtp(data.otp);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    await handleSendOtp();
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      if (email && !validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (phone && !validatePhone(phone)) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      const normalizedPhone = phone ? normalizePhoneNumber(phone, countryCode) : phone;

      // If phone is provided, verify OTP first
      if (normalizedPhone) {
        const otpRes = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: normalizedPhone, otp, countryCode }),
        });
        const otpData = await parseJsonResponse(otpRes);
        if (!otpRes.ok) throw new Error(otpData?.message || 'Invalid or expired OTP');
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, surname, email, phone: normalizedPhone, password, age, gender }),
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data?.message || 'Registration failed');

      localStorage.setItem('token', data.data.token);
      onLoginSuccess(data.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const normalizedIdentifier = normalizePhoneNumber(identifier);
      const loginIdentifier = /^\+?\d{10,12}$/.test(identifier.replace(/\D/g, ''))
        ? normalizedIdentifier
        : identifier;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginIdentifier, password }),
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data?.message || 'Authentication failed');

      localStorage.setItem('token', data.data.token);
      onLoginSuccess(data.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithOtp = async () => {
    setLoading(true);
    setError('');

    try {
      if (!phone) {
        throw new Error('Please enter your phone number');
      }

      if (!validatePhone(phone)) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      const normalizedPhone = normalizePhoneNumber(phone, countryCode);
      if (!normalizedPhone) {
        throw new Error('Invalid phone number format');
      }

      if (!otpStep) {
        await handleSendOtp();
        return;
      }

      const res = await fetch('/api/auth/login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, otp, countryCode }),
      });

      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data?.message || 'OTP login failed');

      localStorage.setItem('token', data.data.token);
      onLoginSuccess(data.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      if (isOtpLogin) {
        await handleLoginWithOtp();
      } else {
        await handleLogin();
      }
    } else {
      if (phone && !otpStep) {
        await handleSendOtp();
      } else {
        await handleRegister();
      }
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError('');

    const socialAuth = async (payload: Record<string, any>) => {
      const res = await fetch(`/api/auth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data?.message || 'Social authentication failed');
      localStorage.setItem('token', data.data.token);
      onLoginSuccess(data.data);
    };

    try {
      if (provider === 'google' && typeof (window as any).google !== 'undefined') {
        (window as any).google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
          callback: async (response: any) => {
            if (!response?.credential) {
              setError('Google sign-in returned no credential');
              setLoading(false);
              return;
            }

            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const tokenData = JSON.parse(jsonPayload);

            await socialAuth({
              token: response.credential,
              email: tokenData.email,
              name: tokenData.name,
              picture: tokenData.picture,
            });
            setLoading(false);
          },
        });

        (window as any).google.accounts.id.prompt();
        return;
      }

      if (provider === 'facebook' && typeof (window as any).FB !== 'undefined') {
        (window as any).FB.login(
          async (response: any) => {
            if (!response?.authResponse) {
              setError('Facebook login cancelled or failed');
              setLoading(false);
              return;
            }

            const accessToken = response.authResponse.accessToken;
            (window as any).FB.api(
              '/me?fields=id,name,email,picture',
              { access_token: accessToken },
              async (userInfo: any) => {
                if (!userInfo?.email) {
                  setError('Facebook login requires an email address');
                  setLoading(false);
                  return;
                }

                await socialAuth({
                  token: accessToken,
                  email: userInfo.email,
                  name: userInfo.name,
                  picture: userInfo.picture?.data?.url,
                  facebookId: userInfo.id,
                });
                setLoading(false);
              }
            );
          },
          { scope: 'public_profile,email' }
        );
        return;
      }

      // Fallback flow when SDKs are not configured.
      const email = window.prompt(`Enter your ${provider} email to continue:`);
      if (!email) throw new Error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign in cancelled`);
      const name = window.prompt('Enter your display name:') || email.split('@')[0];

      await socialAuth({
        token: `fallback_${provider}`,
        email,
        name,
        picture: '',
        facebookId: provider === 'facebook' ? `fb_${Date.now()}` : undefined,
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Social login failed');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-brand-bg w-full max-w-md rounded-2xl shadow-2xl relative my-8"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-brand-muted hover:text-brand-text transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif font-bold text-brand-text mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-brand-muted">
                  {message || (isLogin ? 'Sign in to access your account' : 'Join us to get started')}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm text-center">
                  {success}
                </div>
              )}

              {isLogin && (
                <div className="mb-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-brand-muted">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpLogin(false);
                      setOtpStep(false);
                      setError('');
                    }}
                    className={`px-3 py-2 rounded-xl ${isOtpLogin ? 'bg-brand-bg border border-brand-border text-brand-text' : 'bg-brand-text text-brand-bg'}`}
                  >
                    Password login
                  </button>
                  <span>or</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpLogin(true);
                      setOtpStep(false);
                      setError('');
                      setPassword('');
                      setIdentifier('');
                    }}
                    className={`px-3 py-2 rounded-xl ${isOtpLogin ? 'bg-brand-text text-brand-bg' : 'bg-brand-bg border border-brand-border text-brand-text'}`}
                  >
                    Phone OTP login
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isLogin ? (
                  // LOGIN FORM
                  <>
                    {isOtpLogin ? (
                      <>
                        <div>
                          <div className="grid grid-cols-[110px_1fr] gap-3 items-end">
                            <div>
                              <label className="block text-sm font-medium text-brand-text mb-1">Country Code</label>
                              <input
                                list="country-codes"
                                type="text"
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="block w-full px-3 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                                placeholder="+91"
                              />
                              <datalist id="country-codes">
                                <option value="+91">India</option>
                                <option value="+1">United States</option>
                                <option value="+44">United Kingdom</option>
                                <option value="+61">Australia</option>
                                <option value="+81">Japan</option>
                                <option value="+49">Germany</option>
                                <option value="+33">France</option>
                                <option value="+86">China</option>
                                <option value="+7">Russia</option>
                                <option value="+971">UAE</option>
                              </datalist>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-brand-text mb-1">Phone Number</label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Phone className="h-5 w-5 text-brand-muted" />
                                </div>
                                <input
                                  type="tel"
                                  required
                                  value={phone}
                                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                                  className="block w-full pl-10 pr-3 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                                  placeholder="1234567890"
                                  maxLength={10}
                                />
                              </div>
                            </div>
                          </div>

                          {otpStep && (
                            <div>
                              <label className="block text-sm font-medium text-brand-text mb-1">Verification Code</label>
                              <input
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => handleOtpChange(e.target.value)}
                                className="block w-full px-3 py-3 text-center tracking-widest text-2xl border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                                placeholder="000000"
                                maxLength={6}
                              />
                            </div>
                          )}

                          {devOtp && otpStep && (
                            <div className="mt-2 p-3 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-text">
                              <strong>Development OTP:</strong> {devOtp}
                            </div>
                          )}

                          {otpStep && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setOtpStep(false);
                                  setOtp('');
                                }}
                                className="flex-1 text-sm text-brand-accent hover:underline text-center"
                              >
                                Change phone number
                              </button>
                              <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={resendCooldown > 0 || loading}
                                className="flex-1 text-sm text-brand-accent hover:underline text-center disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-brand-text mb-1">Email or Phone</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <UserIcon className="h-5 w-5 text-brand-muted" />
                            </div>
                            <input
                              type="text"
                              required
                              value={identifier}
                              onChange={(e) => setIdentifier(e.target.value)}
                              className="block w-full pl-10 pr-3 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                              placeholder="Email or Phone Number"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-brand-text mb-1">Password</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-brand-muted" />
                            </div>
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="block w-full pl-10 pr-10 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPassword ? (
                                <svg className="h-5 w-5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                              ) : (
                                <svg className="h-5 w-5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-brand-border rounded"
                          />
                          <label htmlFor="remember-me" className="ml-2 block text-sm text-brand-muted">
                            Remember me
                          </label>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  // REGISTRATION FORM
                  <>
                    {!otpStep ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-brand-text mb-1">Name</label>
                            <input
                              type="text"
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="block w-full px-3 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                              placeholder="First Name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-brand-text mb-1">Surname</label>
                            <input
                              type="text"
                              required
                              value={surname}
                              onChange={(e) => setSurname(e.target.value)}
                              className="block w-full px-3 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                              placeholder="Last Name"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-[110px_1fr] gap-3 items-end">
                          <div>
                            <label className="block text-sm font-medium text-brand-text mb-1">Country Code</label>
                            <input
                              list="country-codes"
                              type="text"
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                              className="block w-full px-3 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                              placeholder="+91"
                            />
                            <datalist id="country-codes">
                              <option value="+91">India</option>
                              <option value="+1">United States</option>
                              <option value="+44">United Kingdom</option>
                              <option value="+61">Australia</option>
                              <option value="+81">Japan</option>
                              <option value="+49">Germany</option>
                              <option value="+33">France</option>
                              <option value="+86">China</option>
                              <option value="+7">Russia</option>
                              <option value="+971">UAE</option>
                            </datalist>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-brand-text mb-1">Phone Number</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-brand-muted" />
                              </div>
                              <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                                className="block w-full pl-10 pr-3 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                                placeholder="1234567890"
                                maxLength={10}
                              />
                            </div>
                          </div>
                        </div>

                        {devOtp && (
                          <div className="p-3 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-text">
                            <strong>Development OTP:</strong> {devOtp}
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-brand-text mb-1">Email Address (Optional)</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-brand-muted" />
                            </div>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="block w-full pl-10 pr-3 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                              placeholder="you@example.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-brand-text mb-1">Age</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-brand-muted" />
                              </div>
                              <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                                placeholder="Age"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-brand-text mb-1">Gender</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Users className="h-5 w-5 text-brand-muted" />
                              </div>
                              <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                              >
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-brand-text mb-1">Password</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-brand-muted" />
                            </div>
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="block w-full pl-10 pr-10 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                              placeholder="••••••••"
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPassword ? (
                                <svg className="h-5 w-5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                              ) : (
                                <svg className="h-5 w-5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                          {password && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-brand-muted">Password strength:</span>
                                <span className={getPasswordStrengthText(getPasswordStrength(password)).color}>
                                  {getPasswordStrengthText(getPasswordStrength(password)).text}
                                </span>
                              </div>
                              <div className="w-full bg-brand-border rounded-full h-1 mt-1">
                                <div
                                  className={`h-1 rounded-full transition-all ${getPasswordStrength(password) <= 1 ? 'bg-red-500' :
                                    getPasswordStrength(password) <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                  style={{ width: `${(getPasswordStrength(password) / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      // OTP VERIFICATION STEP
                      <div className="space-y-4">
                        <p className="text-sm text-brand-text text-center">
                          We've sent a verification code to <strong>{phone}</strong>.
                          <br />(Check your terminal/console for the mock OTP)
                        </p>
                        <div>
                          <label className="block text-sm font-medium text-brand-text mb-1">Verification Code</label>
                          <input
                            type="text"
                            required
                            value={otp}
                            onChange={(e) => handleOtpChange(e.target.value)}
                            className="block w-full px-3 py-3 text-center tracking-widest text-2xl border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                            placeholder="000000"
                            maxLength={6}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setOtpStep(false)}
                            className="flex-1 text-sm text-brand-accent hover:underline text-center"
                          >
                            Change phone number
                          </button>
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={resendCooldown > 0 || loading}
                            className="flex-1 text-sm text-brand-accent hover:underline text-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading || (isLogin && isOtpLogin && !phone) || (!isLogin && !phone && !email)}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-brand-bg bg-brand-text hover:bg-brand-text/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-text disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    isLogin
                      ? isOtpLogin
                        ? otpStep
                          ? 'Verify & Sign In'
                          : 'Send OTP'
                        : 'Sign In'
                      : otpStep
                        ? 'Verify & Create Account'
                        : phone
                          ? 'Send OTP'
                          : 'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-brand-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-brand-bg text-brand-muted">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSocialLogin('google')}
                    disabled={loading}
                    className="w-full inline-flex justify-center py-2.5 px-4 border border-brand-border rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </button>
                  <button
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={loading}
                    className="w-full inline-flex justify-center py-2.5 px-4 border border-brand-border rounded-xl shadow-sm bg-[#1877F2] text-sm font-medium text-white hover:bg-[#1877F2]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2] transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                    Facebook
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-brand-muted hover:text-brand-text transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
