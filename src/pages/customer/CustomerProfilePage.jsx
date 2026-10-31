import React, { useState } from 'react';
import { User, Lock, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { showSuccessAlert, showErrorAlert, showToast } from '../../utils/alerts';

export const CustomerProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await authService.updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        avatar: profileData.avatar,
        address: {
          street: profileData.street,
          city: profileData.city,
          state: profileData.state,
          postalCode: profileData.postalCode,
        },
      });

      if (res.success && res.user) {
        updateUser(res.user);
        showSuccessAlert('Profile Updated', 'Your contact and address information have been saved.');
      }
    } catch (err) {
      showErrorAlert('Update Failed', err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showErrorAlert('Password Mismatch', 'New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      showErrorAlert('Weak Password', 'New password must be at least 6 characters long');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      if (res.success) {
        showSuccessAlert('Password Changed', 'Your account password has been updated securely.');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      showErrorAlert('Password Change Failed', err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Profile Info Form */}
      <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <span>Personal & Address Details</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Keep your billing information and phone number current for instant booking updates.
          </p>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-darkText">Full Name</label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-darkText">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-darkText">Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-darkText">Avatar Image URL</label>
              <input
                type="text"
                value={profileData.avatar}
                onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider">Default Billing Address</h3>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-darkText">Street Address</label>
              <input
                type="text"
                placeholder="Flat / House / Street"
                value={profileData.street}
                onChange={(e) => setProfileData({ ...profileData, street: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-darkText">City</label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-darkText">State</label>
                <input
                  type="text"
                  value={profileData.state}
                  onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-darkText">PIN Code</label>
                <input
                  type="text"
                  value={profileData.postalCode}
                  onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" isLoading={profileLoading}>
              <Save className="w-4 h-4 mr-2" />
              <span>Save Profile Details</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <span>Change Account Password</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Ensure your account is protected with a strong, unique password.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-darkText">Current Password</label>
            <input
              type="password"
              required
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-darkText">New Password</label>
            <input
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-darkText">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="Re-type new password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button type="submit" variant="secondary" className="w-full justify-center" isLoading={passwordLoading}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};
