import { AdminUser, AdminRole } from '../types';

export const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'user-admin',
    username: 'admin',
    password: 'sotra2025',
    role: 'admin',
    nameAr: 'المدير العام (Super Admin)',
    nameEn: 'Super Administrator'
  },
  {
    id: 'user-orders',
    username: 'orders',
    password: 'orders123',
    role: 'orders',
    nameAr: 'مسؤول الطلبات والشحن',
    nameEn: 'Orders & Shipping Manager'
  },
  {
    id: 'user-data-entry',
    username: 'data_entry',
    password: 'data123',
    role: 'data_entry',
    nameAr: 'مدخل بيانات المنتجات',
    nameEn: 'Data Entry Specialist'
  },
  {
    id: 'user-management',
    username: 'manager',
    password: 'manage123',
    role: 'management',
    nameAr: 'إدارة المتجر والمبيعات',
    nameEn: 'Operations & Management'
  }
];

const KEY_ADMIN_USERS = 'sotra_admin_users';
const KEY_CURRENT_USER = 'sotra_current_admin_user';
const KEY_REMEMBERED = 'sotra_remembered_admin_credentials';

export function getAdminUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(KEY_ADMIN_USERS);
    if (!raw) {
      localStorage.setItem(KEY_ADMIN_USERS, JSON.stringify(DEFAULT_ADMIN_USERS));
      return DEFAULT_ADMIN_USERS;
    }
    const list: AdminUser[] = JSON.parse(raw);
    const adminIndex = list.findIndex((u) => u.role === 'admin' || u.id === 'user-admin');

    if (adminIndex === -1) {
      const merged = [DEFAULT_ADMIN_USERS[0], ...list];
      localStorage.setItem(KEY_ADMIN_USERS, JSON.stringify(merged));
      return merged;
    }

    // Auto-migrate old demo password if untouched
    if (list[adminIndex].password === 'SOTRA20260') {
      list[adminIndex].password = 'sotra2025';
      localStorage.setItem(KEY_ADMIN_USERS, JSON.stringify(list));
    }

    return list;
  } catch {
    return DEFAULT_ADMIN_USERS;
  }
}

export function saveAdminUsers(users: AdminUser[]) {
  try {
    localStorage.setItem(KEY_ADMIN_USERS, JSON.stringify(users));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Updates primary admin username and password from inside the Admin Dashboard
 */
export function updateAdminCredentials(newUsername: string, newPassword: string): boolean {
  try {
    const users = getAdminUsers();
    const adminIdx = users.findIndex((u) => u.role === 'admin' || u.id === 'user-admin');
    const updatedUsername = newUsername.trim() || 'admin';
    const updatedPassword = newPassword.trim() || 'sotra2025';

    if (adminIdx !== -1) {
      users[adminIdx].username = updatedUsername;
      users[adminIdx].password = updatedPassword;
    } else {
      users.unshift({
        id: 'user-admin',
        username: updatedUsername,
        password: updatedPassword,
        role: 'admin',
        nameAr: 'المدير العام (Super Admin)',
        nameEn: 'Super Administrator'
      });
    }

    saveAdminUsers(users);

    // Update current session if currently logged in as admin
    const current = getCurrentAdminUser();
    if (current && (current.role === 'admin' || current.id === 'user-admin')) {
      setCurrentAdminUser({
        ...current,
        username: updatedUsername,
        password: updatedPassword
      });
    }

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

/**
 * Reset admin credentials back to default admin / sotra2025
 */
export function resetAdminCredentialsToDefault(): AdminUser[] {
  saveAdminUsers(DEFAULT_ADMIN_USERS);
  return DEFAULT_ADMIN_USERS;
}

export function authenticateAdmin(
  usernameInput: string,
  passwordInput: string
): AdminUser | null {
  const users = getAdminUsers();
  const trimmedUser = usernameInput.trim().toLowerCase();
  const trimmedPass = passwordInput.trim();

  // Match against users configured from inside dashboard
  const found = users.find(
    (u) => u.username.trim().toLowerCase() === trimmedUser && u.password === trimmedPass
  );

  if (found) {
    setCurrentAdminUser(found);
    return found;
  }

  // Fallback for default admin credentials (admin / sotra2025)
  if (trimmedUser === 'admin' && trimmedPass === 'sotra2025') {
    const defaultAdmin = users.find((u) => u.role === 'admin') || DEFAULT_ADMIN_USERS[0];
    setCurrentAdminUser(defaultAdmin);
    return defaultAdmin;
  }

  return null;
}

export function getCurrentAdminUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(KEY_CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentAdminUser(user: AdminUser | null) {
  try {
    if (user) {
      localStorage.setItem(KEY_CURRENT_USER, JSON.stringify(user));
      localStorage.setItem('sotra_admin_auth', 'true');
    } else {
      localStorage.removeItem(KEY_CURRENT_USER);
      localStorage.removeItem('sotra_admin_auth');
    }
  } catch (e) {
    console.error(e);
  }
}

export function getRememberedCredentials(): { username: string; password: string; remember: boolean } {
  try {
    const raw = localStorage.getItem(KEY_REMEMBERED);
    return raw ? JSON.parse(raw) : { username: 'admin', password: 'sotra2025', remember: true };
  } catch {
    return { username: 'admin', password: 'sotra2025', remember: true };
  }
}

export function saveRememberedCredentials(username: string, password: string, remember: boolean) {
  try {
    if (remember) {
      localStorage.setItem(KEY_REMEMBERED, JSON.stringify({ username, password, remember: true }));
    } else {
      localStorage.removeItem(KEY_REMEMBERED);
    }
  } catch (e) {
    console.error(e);
  }
}

// Role-based visible tabs mapping
export function getAllowedTabsForRole(role: AdminRole): string[] {
  switch (role) {
    case 'admin':
      return [
        'products',
        'categories',
        'marketing',
        'look_coordination',
        'bundles',
        'orders',
        'customers',
        'settings',
        'backup',
        'users'
      ];
    case 'orders':
      return ['orders', 'customers'];
    case 'data_entry':
      return ['products', 'categories', 'look_coordination', 'bundles'];
    case 'management':
      return ['orders', 'products', 'categories', 'marketing', 'customers'];
    default:
      return ['products'];
  }
}
