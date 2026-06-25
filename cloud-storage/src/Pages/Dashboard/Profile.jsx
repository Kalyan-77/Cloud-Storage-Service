import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Calendar, Edit2, Save, X, Shield, Clock, Trash2, Camera } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { authService } from '../../Services/authService';
import { BASE_URL } from '../../../config';
import Loading from '../../Components/Loading';

const Profile = () => {
  const { user, setUser, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage({ type: '', text: '' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || '',
      email: user.email || ''
    });
    setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    if (!user?._id) {
      setMessage({ type: 'error', text: 'User ID not found' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = await authService.updateAuthProfile(user._id, formData);

      if (data.success) {
        const updatedUser = {
          ...user,
          ...data.user,
          updatedAt: new Date().toISOString()
        };
        setUser(updatedUser);

        setFormData({
          name: updatedUser.name || '',
          email: updatedUser.email || ''
        });

        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });

        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Update error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || error.response?.data?.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("name", user.name);
    form.append("avatar", file);

    setAvatarLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = await authService.updateWhatsAppProfile(form);

      // Refresh the context session to load the new avatar URL
      if (refreshUser) {
        await refreshUser();
      } else {
        setUser(prev => ({ ...prev, avatar: data.avatar || prev.avatar }));
      }

      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Avatar update error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || error.response?.data?.message || 'Failed to upload profile picture.'
      });
    } finally {
      setAvatarLoading(false);
      e.target.value = '';
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?._id) {
      setMessage({ type: 'error', text: 'User ID not found' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const data = await authService.deleteAccount(user._id);

      if (data.success) {
        await authService.logout();
        setUser(null);
        setMessage({ type: 'success', text: 'Account deleted successfully!' });

        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || error.response?.data?.message || 'Failed to delete account. Please try again.'
      });
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const avatarUrl = user?.avatar ? `${BASE_URL}${user.avatar}` : null;

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
            <p className="text-slate-500 mt-1">Manage your public profile details and account security preferences.</p>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-8 p-4 rounded-xl border transition-all duration-300 shadow-sm flex items-center gap-3 ${message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
            <span className="font-semibold">{message.type === 'success' ? '✓' : '⚠️'}</span>
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - User Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden sticky top-6">

              {/* Card Banner */}
              <div className="h-32 bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 relative" />

              {/* Card Main Info */}
              <div className="px-6 pb-8 pt-0 flex flex-col items-center -mt-16 relative">

                {/* Avatar container with hover upload effect */}
                <div
                  onClick={handleAvatarClick}
                  className="group relative w-32 h-32 rounded-full border-4 border-white bg-slate-100 shadow-md overflow-hidden cursor-pointer mb-4"
                >
                  {avatarLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loading size="sm" text="" />
                    </div>
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user?.name || "Avatar"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      <User className="w-14 h-14" />
                    </div>
                  )}

                  {/* Camera Icon Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />

                <h2 className="text-xl font-bold text-slate-800">{user?.name || 'User'}</h2>
                <p className="text-sm text-slate-500 mt-1">{user?.email || 'email@example.com'}</p>

                {/* Meta details list */}
                <div className="w-full border-t border-slate-100 mt-6 pt-6 space-y-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div className="text-xs">
                      <p className="text-slate-400 font-medium">Joined On</p>
                      <p className="font-semibold text-slate-700">{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div className="text-xs">
                      <p className="text-slate-400 font-medium">Last Modified</p>
                      <p className="font-semibold text-slate-700">{formatDate(user?.updatedAt)}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column - Settings and Configurations */}
          <div className="lg:col-span-2 space-y-8">

            {/* Personal Details Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                  <p className="text-sm text-slate-500 mt-1">Update your general details here.</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-blue-600 rounded-xl hover:bg-blue-50 border border-blue-100 transition-colors text-sm font-semibold cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50/50"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <User className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-700 font-medium">{user?.name || 'N/A'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50/50"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-700 font-medium">{user?.email || 'N/A'}</span>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-6 border-t border-slate-100">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-sm shadow-md shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Account Security Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8">
              <div className="flex items-start justify-between gap-4 flex-col md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Account Password</h3>
                    <p className="text-sm text-slate-500 mt-1">Keep your login credentials secure and updated.</p>
                  </div>
                </div>
                <a href='/forgetPassword' className="no-underline">
                  <button className="px-5 py-2.5 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors text-sm font-semibold cursor-pointer">
                    Change Password
                  </button>
                </a>
              </div>
            </div>

            {/* Danger Zone Card */}
            <div className="bg-red-50/50 rounded-3xl shadow-sm border border-red-200/80 p-8">
              <div className="flex items-start justify-between gap-4 flex-col md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-950">Delete Account</h3>
                    <p className="text-sm text-red-700/80 mt-1">Permanently remove all storage records and integration configurations.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-sm font-semibold cursor-pointer shadow-md shadow-red-500/10"
                >
                  Delete Account
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Are you sure?</h3>
                  <p className="text-sm text-slate-400 mt-1">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-8">
                Deleting your account will permanently remove all configuration settings, local files database links, and unlink your Google Drive account.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold text-sm disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={loading}
                  className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-semibold text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;