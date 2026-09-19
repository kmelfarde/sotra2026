import React, { useState } from 'react';
import { Shield, Key, Lock, CheckCircle2, Eye, EyeOff, RotateCcw, User, UserCheck } from 'lucide-react';
import { AdminUser, AdminRole } from '../../types';
import {
  getAdminUsers,
  saveAdminUsers,
  updateAdminCredentials,
  resetAdminCredentialsToDefault
} from '../../utils/adminAuth';

interface AdminUsersTabProps {
  isArabic: boolean;
  onNotify: (msg: string) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ isArabic, onNotify }) => {
  const [users, setUsers] = useState<AdminUser[]>(getAdminUsers);
  const adminUser = users.find((u) => u.role === 'admin' || u.id === 'user-admin') || users[0];

  // Primary Admin Form State
  const [adminUsername, setAdminUsername] = useState(adminUser?.username || 'admin');
  const [adminPassword, setAdminPassword] = useState(adminUser?.password || 'sotra2025');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Other Users Editing State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUsernameVal, setEditUsernameVal] = useState('');
  const [editPasswordVal, setEditPasswordVal] = useState('');
  const [showSubPassword, setShowSubPassword] = useState<Record<string, boolean>>({});

  const toggleShowSubPassword = (id: string) => {
    setShowSubPassword((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSavePrimaryAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim()) {
      alert(isArabic ? 'يرجى إدخال اسم المستخدم للمدير' : 'Please enter admin username');
      return;
    }
    if (!adminPassword.trim()) {
      alert(isArabic ? 'يرجى إدخال كلمة المرور للمدير' : 'Please enter admin password');
      return;
    }

    const success = updateAdminCredentials(adminUsername.trim(), adminPassword.trim());
    if (success) {
      setUsers(getAdminUsers());
      onNotify(
        isArabic
          ? `تم تعيين بيانات المدير بنجاح: (${adminUsername.trim()})`
          : `Admin credentials saved: (${adminUsername.trim()})`
      );
    }
  };

  const handleResetToDefault = () => {
    if (
      window.confirm(
        isArabic
          ? 'هل تريد استعادة بيانات الدخول الافتراضية للمدير: admin / sotra2025؟'
          : 'Reset to default admin credentials: admin / sotra2025?'
      )
    ) {
      const reset = resetAdminCredentialsToDefault();
      setUsers(reset);
      setAdminUsername('admin');
      setAdminPassword('sotra2025');
      onNotify(
        isArabic
          ? 'تمت استعادة بيانات الدخول الافتراضية: admin / sotra2025'
          : 'Reset to default: admin / sotra2025'
      );
    }
  };

  const handleSaveSubUser = (userId: string) => {
    if (!editPasswordVal.trim()) {
      alert(isArabic ? 'يرجى إدخال كلمة مرور جديدة' : 'Please enter a password');
      return;
    }

    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          username: editUsernameVal.trim() || u.username,
          password: editPasswordVal.trim()
        };
      }
      return u;
    });

    setUsers(updated);
    saveAdminUsers(updated);
    setEditingUserId(null);
    setEditUsernameVal('');
    setEditPasswordVal('');
    onNotify(isArabic ? 'تم تحديث الحساب بنجاح' : 'User account updated successfully');
  };

  const getRoleLabel = (role: AdminRole) => {
    switch (role) {
      case 'admin':
        return isArabic ? 'المدير العام (كافة الصلاحيات والإعدادات)' : 'Super Administrator (Full Access)';
      case 'orders':
        return isArabic ? 'مسؤول الطلبات (إدارة الطلبات والشحن والعملاء)' : 'Orders & Shipping Manager';
      case 'data_entry':
        return isArabic ? 'مدخل بيانات (إضافة وتعديل المنتجات والأقسام)' : 'Data Entry Specialist';
      case 'management':
        return isArabic ? 'إدارة العمليات (الطلبات، المنتجات، العملاء)' : 'Operations Manager';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. PRIMARY ADMIN CREDENTIALS CONFIGURATION CARD */}
      <div className="bg-white border-2 border-neutral-900 rounded-lg p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4 mb-5">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                  {isArabic ? 'تعيين اسم مستخدم وكلمة مرور المدير العام' : 'Super Admin Credentials (Main)'}
                </h3>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                  {isArabic ? 'الافتراضي: admin / sotra2025' : 'Default: admin / sotra2025'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {isArabic
                  ? 'يمكنك تغيير وتعيين اسم المستخدم وكلمة المرور مباشرة من هنا بدون الحاجة لقاعدة بيانات أو Authentication خارجي.'
                  : 'Manage the primary admin username and password directly from this dashboard without Firebase Auth dependency.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="self-start sm:self-center px-3 py-1.5 border border-neutral-300 hover:border-black text-[11px] font-bold rounded text-neutral-700 hover:text-black flex items-center space-x-1.5 rtl:space-x-reverse transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isArabic ? 'استعادة الافتراضي (sotra2025)' : 'Reset Default'}</span>
          </button>
        </div>

        <form onSubmit={handleSavePrimaryAdmin} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                {isArabic ? 'اسم مستخدم المدير (Username)' : 'Admin Username'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm text-neutral-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-black transition"
                />
                <User className="w-4 h-4 text-neutral-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">
                {isArabic ? 'القيمة الافتراضية: admin' : 'Default: admin'}
              </span>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1.5">
                {isArabic ? 'كلمة مرور المدير (Password)' : 'Admin Password'}
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="sotra2025"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded text-sm text-neutral-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-black transition"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute left-3 rtl:left-auto rtl:right-3 top-3 text-neutral-400 hover:text-black transition"
                  aria-label="Toggle password visibility"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">
                {isArabic ? 'القيمة الافتراضية: sotra2025' : 'Default: sotra2025'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded text-[11px] font-medium border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isArabic
                  ? 'تم إلغاء Firebase Authentication للحسابات وتعيين الصلاحيات محلياً، بينما جميع المنتجات والأقسام والطلبات مرتبطة بفايربيس.'
                  : 'Admin auth is handled locally without Firebase Auth; store data & orders remain 100% on Firebase.'}
              </span>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider rounded transition flex items-center space-x-2 rtl:space-x-reverse cursor-pointer shadow-sm"
            >
              <Key className="w-4 h-4 text-amber-400" />
              <span>{isArabic ? 'حفظ وتعيين بيانات المدير' : 'Save Admin Credentials'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. SUB-ROLES AND OTHER STAFF ACCOUNTS */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 sm:p-6 shadow-xs">
        <div className="flex items-center space-x-2 rtl:space-x-reverse border-b border-neutral-100 pb-3 mb-4">
          <UserCheck className="w-5 h-5 text-neutral-800" />
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              {isArabic ? 'حسابات فريق العمل والصلاحيات الإضافية' : 'Team Accounts & Sub-Roles'}
            </h3>
            <p className="text-[11px] text-neutral-500">
              {isArabic
                ? 'حسابات مخصصة لمدخل البيانات، ومسؤول الشحن، وإدارة العمليات لتحديد الشاشات المسموحة لكل فرد.'
                : 'Role-restricted accounts for data entry, shipping, and order management.'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {users
            .filter((u) => u.role !== 'admin' && u.id !== 'user-admin')
            .map((user) => {
              const isEditing = editingUserId === user.id;
              const isShown = !!showSubPassword[user.id];

              return (
                <div
                  key={user.id}
                  className="p-4 border border-neutral-200 rounded-lg bg-neutral-50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="font-bold text-xs text-neutral-900">
                        {isArabic ? user.nameAr : user.nameEn}
                      </span>
                      <span className="px-2 py-0.5 bg-neutral-800 text-white text-[10px] font-bold rounded">
                        {user.role}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-600 flex items-center space-x-3 rtl:space-x-reverse">
                      <span>
                        {isArabic ? 'اسم المستخدم:' : 'Username:'}{' '}
                        <strong className="text-neutral-900 font-mono">{user.username}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        {isArabic ? 'كلمة المرور:' : 'Password:'}{' '}
                        <strong className="text-neutral-900 font-mono">
                          {isShown ? user.password : '••••••••'}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleShowSubPassword(user.id)}
                        className="text-neutral-500 hover:text-black transition"
                        aria-label="Toggle password"
                      >
                        {isShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-500">{getRoleLabel(user.role)}</p>
                  </div>

                  <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
                    {isEditing ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <input
                          type="text"
                          value={editUsernameVal}
                          onChange={(e) => setEditUsernameVal(e.target.value)}
                          placeholder={isArabic ? 'اسم المستخدم' : 'Username'}
                          className="p-1.5 bg-white border border-neutral-300 rounded text-xs font-mono w-28"
                        />
                        <input
                          type="text"
                          value={editPasswordVal}
                          onChange={(e) => setEditPasswordVal(e.target.value)}
                          placeholder={isArabic ? 'كلمة المرور' : 'Password'}
                          className="p-1.5 bg-white border border-neutral-300 rounded text-xs font-mono w-28"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveSubUser(user.id)}
                          className="px-2.5 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded cursor-pointer"
                        >
                          {isArabic ? 'حفظ' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUserId(null);
                            setEditUsernameVal('');
                            setEditPasswordVal('');
                          }}
                          className="px-2.5 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold rounded cursor-pointer"
                        >
                          {isArabic ? 'إلغاء' : 'Cancel'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUserId(user.id);
                          setEditUsernameVal(user.username);
                          setEditPasswordVal(user.password);
                        }}
                        className="px-3 py-1.5 bg-white border border-neutral-300 hover:border-black text-xs font-bold rounded text-neutral-800 transition cursor-pointer flex items-center space-x-1.5 rtl:space-x-reverse"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>{isArabic ? 'تعديل الحساب' : 'Edit Account'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
