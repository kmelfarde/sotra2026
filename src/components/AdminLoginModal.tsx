import React, { useState, useEffect } from 'react';
import { X, Lock, Shield, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import {
  authenticateAdmin,
  getRememberedCredentials,
  saveRememberedCredentials
} from '../utils/adminAuth';
import { AdminUser } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user?: AdminUser) => void;
  isArabic: boolean;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isArabic
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const remembered = getRememberedCredentials();
      if (remembered.remember && remembered.username) {
        setUsername(remembered.username);
        setPassword(remembered.password);
        setRememberMe(true);
      } else {
        setUsername('');
        setPassword('');
      }
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = authenticateAdmin(username, password);

    if (user) {
      saveRememberedCredentials(username, password, rememberMe);
      onSuccess(user);
    } else {
      setError(
        isArabic
          ? 'بيانات الدخول غير صحيحة. يرجى التحقق من اسم المستخدم وكلمة المرور.'
          : 'Invalid credentials. Please verify your username and password.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 text-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-wider uppercase">
                {isArabic ? 'تسجيل دخول لوحة الإدارة' : 'Administration Login'}
              </h3>
              <span className="text-[10px] text-neutral-400 font-mono block">
                SOTRA Fashion Portal
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form
          method="post"
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 space-y-4"
          autoComplete="on"
        >
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded flex items-center space-x-2 rtl:space-x-reverse">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Username Input with AutoFill support */}
          <div>
            <label
              htmlFor="admin-username"
              className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5"
            >
              {isArabic ? 'اسم المستخدم' : 'Username'}
            </label>
            <input
              id="admin-username"
              name="username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-white transition font-medium"
            />
          </div>

          {/* Password Input with AutoFill support */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5"
            >
              {isArabic ? 'كلمة المرور' : 'Password'}
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded text-sm text-white focus:outline-none focus:border-white transition font-medium"
            />
          </div>

          {/* Remember Password Checkbox */}
          <div className="flex items-center justify-between text-xs text-neutral-300 pt-1">
            <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-white rounded cursor-pointer"
              />
              <span className="text-[12px] font-medium text-neutral-300">
                {isArabic ? 'حفظ كلمة المرور وبيانات الدخول' : 'Remember Password & Login'}
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-widest rounded transition flex items-center justify-center space-x-2 rtl:space-x-reverse cursor-pointer shadow-lg"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تسجيل الدخول' : 'Sign In'}</span>
              {isArabic ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-neutral-400">
              {isArabic
                ? 'الحساب الافتراضي: admin | كلمة المرور: sotra2025'
                : 'Default credentials: admin | Password: sotra2025'}
            </p>
            <p className="text-[10px] text-neutral-500 mt-0.5">
              {isArabic
                ? 'يمكنك تغيير اسم المستخدم وكلمة المرور من داخل لوحة الإدارة في أي وقت'
                : 'Can be changed directly from inside the admin dashboard'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

