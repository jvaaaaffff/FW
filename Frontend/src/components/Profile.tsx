import React, { useState, useEffect } from 'react';
import { User, Settings, ShoppingBag, LogOut, AlertTriangle, Bell, Shield, Globe, MapPin, Calendar, Phone, Truck, Mail, Camera, CheckCircle, XCircle } from 'lucide-react';
import { Order } from '../types';
import { formatPrice } from '../utils/format';

interface ProfileProps {
  user: any;
  onLogout: () => void;
  setView: (view: any) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout, setView }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [activeSettingTab, setActiveSettingTab] = useState('notifications');

  // Profile State
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [surname, setSurname] = useState(user?.surname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [age, setAge] = useState(user?.age || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [facebookUrl, setFacebookUrl] = useState(user?.facebookUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '', country: '' });

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Settings State
  const [notifications, setNotifications] = useState({ email: true, sms: false, push: true });
  const [privacy, setPrivacy] = useState({ publicProfile: false, showActivity: true });
  const [language, setLanguage] = useState('English');

  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // In a real app, fetch user details and orders from the backend
    setDisplayName(user?.name || '');
    setSurname(user?.surname || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setAge(user?.age || '');
    setGender(user?.gender || '');
    setAvatarUrl(user?.avatarUrl || '');
    setFacebookUrl(user?.facebookUrl || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMessage({ type: '', text: '' });
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || activeTab !== 'orders') return;
      setIsLoadingOrders(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/orders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setOrders(data.data);
        }
      } catch {
        // Silent order fetch failure.
      } finally {
        setIsLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [user, activeTab]);

  const handlePhotoUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (!currentPassword || !newPassword) {
      setPasswordMessage({ type: 'error', text: 'Please enter both current and new password.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          password: newPassword
        })
      });

      if (!res.ok) throw new Error('Failed to update password.');

      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error.message || 'Unable to update password.' });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: displayName,
          surname,
          email,
          phone,
          age,
          gender,
          avatarUrl,
          facebookUrl,
          address,
          notifications,
          privacy,
          language
        })
      });

      if (!res.ok) throw new Error('Failed to update profile');

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to cancel order');

      // Refresh orders
      const ordersRes = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.data);
      }

      setMessage({ type: 'success', text: 'Order cancelled successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to cancel order' });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Call backend to delete account
      const token = localStorage.getItem('token');
      await fetch('/api/users/profile', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      onLogout();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete account.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-brand-bg border border-brand-border rounded-2xl p-6 sticky top-24 shadow-sm">
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-brand-accent/10 mb-4 border-2 border-brand-accent/20">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-accent">
                    <User className="w-10 h-10" />
                  </div>
                )}
                <label className="absolute right-0 bottom-0 p-2 bg-brand-bg border border-brand-border rounded-full cursor-pointer shadow-sm">
                  <Camera className="w-4 h-4 text-brand-text" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handlePhotoUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
              <h2 className="text-xl font-serif font-bold text-brand-text text-center">{user?.name || 'User'}</h2>
              <p className="text-sm text-brand-muted text-center">{user?.email || user?.phone || 'No contact linked'}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand-border px-3 py-1 text-xs text-brand-muted">
                <Shield className="w-4 h-4" />
                {user?.authProvider === 'google'
                  ? 'Google account linked'
                  : user?.authProvider === 'facebook'
                    ? 'Facebook account linked'
                    : 'Local account'}
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${activeTab === 'profile'
                  ? 'bg-brand-text text-brand-bg font-medium'
                  : 'text-brand-text hover:bg-brand-border/30'
                  }`}
              >
                <User className="w-5 h-5 mr-3" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${activeTab === 'orders'
                  ? 'bg-brand-text text-brand-bg font-medium'
                  : 'text-brand-text hover:bg-brand-border/30'
                  }`}
              >
                <ShoppingBag className="w-5 h-5 mr-3" />
                Orders
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${activeTab === 'settings'
                  ? 'bg-brand-text text-brand-bg font-medium'
                  : 'text-brand-text hover:bg-brand-border/30'
                  }`}
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </button>
              <div className="pt-4 mt-4 border-t border-brand-border">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {message.text && (
            <div className={`p-4 mb-6 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
              {message.text}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-brand-bg border border-brand-border rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-serif font-bold text-brand-text mb-6">Personal Information</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-2">First Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-2">Last Name</label>
                    <input
                      type="text"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      className="w-full px-4 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!!user?.email} // Disable if they signed up with email
                      className={`w-full px-4 py-3 border border-brand-border rounded-xl ${user?.email ? 'bg-gray-50 text-brand-muted cursor-not-allowed' : 'focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!!user?.phone}
                      className={`w-full px-4 py-3 border border-brand-border rounded-xl ${user?.phone ? 'bg-gray-50 text-brand-muted cursor-not-allowed' : 'focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text'}`}
                    />
                    {user?.authProvider === 'google' && !user?.phone && (
                      <p className="mt-2 text-xs text-amber-700">Google login detected. Please add your phone number to complete your profile.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-2">Facebook Profile URL</label>
                    <input
                      type="url"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/yourprofile"
                      className="w-full px-4 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-2">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-4 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-2">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 p-6 border border-brand-border rounded-3xl bg-white/80">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-brand-text mb-3">Connected Accounts</h4>
                      <p className="text-sm text-brand-muted">
                        Manage your linked social accounts. Connect or disconnect accounts to customize your login options.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Google Account */}
                      <div className="rounded-2xl border border-brand-border p-4 bg-brand-bg">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="#4285F4" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-brand-text">Google</p>
                              <p className="text-xs text-brand-muted">{user?.authProvider === 'google' ? '✓ Connected' : 'Not connected'}</p>
                            </div>
                          </div>
                          {user?.authProvider === 'google' ? (
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">Connected</span>
                          ) : (
                            <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1 rounded-full">Disconnected</span>
                          )}
                        </div>
                        <p className="text-xs text-brand-muted mb-3">Use your Google account to sign in securely.</p>
                        {user?.authProvider !== 'google' && (
                          <button
                            type="button"
                            onClick={() => setMessage({ type: 'info', text: 'Sign out and use Google login from the login modal to connect your Google account.' })}
                            className="w-full py-2 px-3 text-sm font-medium bg-brand-text text-brand-bg rounded-lg hover:bg-brand-text/90 transition-colors"
                          >
                            Connect with Google
                          </button>
                        )}
                      </div>

                      {/* Facebook Account */}
                      <div className="rounded-2xl border border-brand-border p-4 bg-brand-bg">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-brand-text">Facebook</p>
                              <p className="text-xs text-brand-muted">{user?.authProvider === 'facebook' ? '✓ Connected' : facebookUrl ? '✓ Profile linked' : 'Not connected'}</p>
                            </div>
                          </div>
                          {user?.authProvider === 'facebook' || facebookUrl ? (
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">Connected</span>
                          ) : (
                            <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1 rounded-full">Disconnected</span>
                          )}
                        </div>
                        <p className="text-xs text-brand-muted mb-3">Link your Facebook profile or use Facebook to sign in.</p>
                        <input
                          type="url"
                          value={facebookUrl}
                          onChange={(e) => setFacebookUrl(e.target.value)}
                          placeholder="https://facebook.com/yourprofile"
                          className="w-full px-3 py-2 text-xs border border-brand-border rounded-lg focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text mb-2"
                        />
                        {user?.authProvider !== 'facebook' && (
                          <button
                            type="button"
                            onClick={() => setMessage({ type: 'info', text: 'Sign out and use Facebook login from the login modal to connect your Facebook account.' })}
                            className="w-full py-2 px-3 text-sm font-medium bg-[#1877F2] text-white rounded-lg hover:bg-[#1877F2]/90 transition-colors"
                          >
                            Connect with Facebook
                          </button>
                        )}
                      </div>

                      {/* Phone Account */}
                      <div className="rounded-2xl border border-brand-border p-4 bg-brand-bg md:col-span-2">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-brand-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948.684l1.498 7.492a1 1 0 00.502.756l4.038 2.27a8 8 0 11-11.313-11.313z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-brand-text">Phone Number</p>
                              <p className="text-xs text-brand-muted">{user?.phone ? user?.phone : 'Add a phone number'}</p>
                            </div>
                          </div>
                          {user?.phone ? (
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">Verified</span>
                          ) : (
                            <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1 rounded-full">Not added</span>
                          )}
                        </div>
                        <p className="text-xs text-brand-muted">Your phone number is used for OTP verification and account recovery.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-6 py-3 bg-brand-text text-brand-bg rounded-xl font-medium hover:bg-brand-text/90 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-brand-bg border border-brand-border rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-serif font-bold text-brand-text mb-6">Order History</h3>
              {isLoadingOrders ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-text mx-auto"></div>
                  <p className="mt-4 text-brand-muted">Loading orders...</p>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-brand-border rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                        <div>
                          <p className="text-sm text-brand-muted mb-1">Order #{order.id}</p>
                          <p className="font-medium text-brand-text">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                          <span className="font-bold text-brand-text">{formatPrice(order.total)}</span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-brand-text mb-2">Items Ordered:</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 bg-brand-border/10 rounded-lg">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-brand-text">{item.product.name}</p>
                                <p className="text-xs text-brand-muted">Qty: {item.quantity} × {formatPrice(item.product.price)}</p>
                              </div>
                              <p className="text-sm font-medium text-brand-text">{formatPrice(item.product.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-brand-text mb-2">Shipping Address:</h4>
                        <p className="text-sm text-brand-muted">
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                          {order.shippingAddress.address}<br />
                          {order.shippingAddress.city}, {order.shippingAddress.country} {order.shippingAddress.postalCode}
                        </p>
                      </div>

                      {/* Payment Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-brand-muted">Payment:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                            order.paymentStatus === 'refunded' ? 'bg-blue-100 text-blue-800' :
                            order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>

                        {/* Cancel Order Button */}
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-brand-border/10 rounded-xl border border-dashed border-brand-border">
                  <ShoppingBag className="w-12 h-12 text-brand-muted mx-auto mb-4" />
                  <p className="text-brand-text font-medium mb-2">No orders yet</p>
                  <p className="text-brand-muted mb-6">When you place an order, it will appear here.</p>
                  <button
                    onClick={() => setView('home')}
                    className="px-6 py-2 bg-brand-text text-brand-bg rounded-xl font-medium hover:bg-brand-text/90 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-brand-bg border border-brand-border rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-serif font-bold text-brand-text mb-6">Account Settings</h3>

              <div className="flex border-b border-brand-border mb-8 overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setActiveSettingTab('notifications')}
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${activeSettingTab === 'notifications' ? 'border-brand-text text-brand-text' : 'border-transparent text-brand-muted hover:text-brand-text'
                    }`}
                >
                  Notifications
                </button>
                <button
                  onClick={() => setActiveSettingTab('privacy')}
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${activeSettingTab === 'privacy' ? 'border-brand-text text-brand-text' : 'border-transparent text-brand-muted hover:text-brand-text'
                    }`}
                >
                  Privacy & Security
                </button>
              </div>

              {activeSettingTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-brand-border rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-brand-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-brand-text">Email Notifications</p>
                        <p className="text-sm text-brand-muted">Receive order updates and promotions via email</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={notifications.email} onChange={() => setNotifications({ ...notifications, email: !notifications.email })} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-text"></div>
                    </label>
                  </div>
                </div>
              )}

              {activeSettingTab === 'privacy' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="p-6 border border-brand-border rounded-3xl bg-brand-bg">
                      <h4 className="text-lg font-semibold text-brand-text mb-4">Security</h4>
                      <p className="text-sm text-brand-muted mb-4">
                        Change your password if you forget it or want a stronger login. After submitting a new password, you can use it immediately.
                      </p>

                      {passwordMessage.text && (
                        <div className={`p-3 rounded-xl mb-4 ${passwordMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                          {passwordMessage.text}
                        </div>
                      )}

                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-brand-text mb-2">Current Password</label>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                            placeholder="Current password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-brand-text mb-2">New Password</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                            placeholder="New password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-brand-text mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-brand-border rounded-xl focus:ring-brand-accent focus:border-brand-accent bg-white/50 text-brand-text"
                            placeholder="Confirm new password"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full px-5 py-3 bg-brand-text text-brand-bg rounded-xl text-sm font-medium hover:bg-brand-text/90 transition-colors"
                        >
                          Update Password
                        </button>
                      </form>
                    </div>

                    <div className="p-6 border border-brand-border rounded-3xl bg-brand-bg">
                      <h4 className="text-lg font-semibold text-brand-text mb-4">Linked Accounts</h4>
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl border border-brand-border bg-white gap-4">
                          <div>
                            <p className="text-sm font-medium text-brand-text">Google</p>
                            <p className="text-sm text-brand-muted">{user?.authProvider === 'google' ? 'Connected' : 'Not linked'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {user?.authProvider === 'google' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-amber-600" />}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('profile');
                                setMessage({ type: 'info', text: 'To connect Google, sign out and use Google login from the main login screen.' });
                              }}
                              className="px-4 py-2 rounded-full border border-brand-border text-sm font-medium text-brand-text hover:bg-brand-text/5 transition-colors"
                            >
                              {user?.authProvider === 'google' ? 'Manage' : 'Connect'}
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl border border-brand-border bg-white gap-4">
                          <div>
                            <p className="text-sm font-medium text-brand-text">Facebook</p>
                            <p className="text-sm text-brand-muted">{facebookUrl ? 'Connected' : 'Enter your Facebook profile URL'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {facebookUrl ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-amber-600" />}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('profile');
                                setMessage({ type: 'info', text: 'Add your Facebook profile URL in the Personal Information section and save changes.' });
                              }}
                              className="px-4 py-2 rounded-full border border-brand-border text-sm font-medium text-brand-text hover:bg-brand-text/5 transition-colors"
                            >
                              {facebookUrl ? 'Update' : 'Connect'}
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl border border-brand-border bg-white gap-4">
                          <div>
                            <p className="text-sm font-medium text-brand-text">Phone</p>
                            <p className="text-sm text-brand-muted">{user?.phone ? 'Verified' : 'Required to secure your account'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {user?.phone ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-amber-600" />}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('profile');
                                setMessage({ type: 'info', text: 'Enter your phone number in the Personal Information section and save changes.' });
                              }}
                              className="px-4 py-2 rounded-full border border-brand-border text-sm font-medium text-brand-text hover:bg-brand-text/5 transition-colors"
                            >
                              {user?.phone ? 'Update' : 'Connect'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-brand-border">
                    <h4 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Danger Zone
                    </h4>
                    <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
                      <p className="text-sm text-red-800 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      {showDeleteConfirm ? (
                        <div className="flex gap-4 flex-wrap">
                          <button
                            onClick={handleDeleteAccount}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                          >
                            Yes, Delete My Account
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 bg-white text-brand-text border border-brand-border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-4 py-2 border border-red-600 text-red-600 rounded-lg text-sm font-medium hover:bg-red-600 hover:text-white transition-colors"
                        >
                          Delete Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
