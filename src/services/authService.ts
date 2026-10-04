import { AppUser, SocialAuthProvider, UserRole, AdminLevel } from '../types';

export const MAIN_ADMIN_EMAIL = 'zapollo1990@gmail.com';

// MẬT KHẨU ĐĂNG NHẬP CHUNG CHO TOÀN BỘ BAN QUẢN TRỊ (ADMIN CHÍNH & ADMIN PHỤ)
export const SHARED_ADMIN_PASSWORD = '123456';
export const DEFAULT_ADMIN_PASSWORD = SHARED_ADMIN_PASSWORD;
export const MAIN_ADMIN_DEFAULT_PASSWORD = SHARED_ADMIN_PASSWORD;
export const SUB_ADMIN_MASTER_PASSWORD = SHARED_ADMIN_PASSWORD;
export const DEFAULT_STUDENT_PASSWORD = '123456';

export interface DesignatedAdminConfig {
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  adminLevel: AdminLevel;
  titleVi: string;
  badgeLabel: string;
  defaultPassword: string;
  passwordHint?: string;
}

export const DESIGNATED_ADMINS: DesignatedAdminConfig[] = [
  {
    name: 'Trần Bảo Ngọc',
    email: 'zapollo1990@gmail.com',
    avatar: '👑',
    role: 'admin',
    adminLevel: 'main',
    titleVi: 'Admin Chính (Tổng Quản Trị)',
    badgeLabel: 'Admin Chính',
    defaultPassword: SHARED_ADMIN_PASSWORD,
    passwordHint: 'Mật khẩu chung Admin: 123456',
  },
  {
    name: 'Lê Thị Yến Nhi',
    email: 'lethiyennhi300507@gmail.com',
    avatar: '🛡️',
    role: 'admin',
    adminLevel: 'sub',
    titleVi: 'Admin Phụ (Phó Quản Trị)',
    badgeLabel: 'Admin Phụ',
    defaultPassword: SHARED_ADMIN_PASSWORD,
    passwordHint: 'Mật khẩu chung Admin: 123456',
  },
  {
    name: 'Lê Thị Tuyết Lệ',
    email: 'tuyetle04042007@gmail.com',
    avatar: '🛡️',
    role: 'admin',
    adminLevel: 'sub',
    titleVi: 'Admin Phụ (Phó Quản Trị)',
    badgeLabel: 'Admin Phụ',
    defaultPassword: SHARED_ADMIN_PASSWORD,
    passwordHint: 'Mật khẩu chung Admin: 123456',
  },
  {
    name: 'Vũ Huỳnh Gia Linh',
    email: 'gialing240207@gmail.com',
    avatar: '🛡️',
    role: 'admin',
    adminLevel: 'sub',
    titleVi: 'Admin Phụ (Phó Quản Trị)',
    badgeLabel: 'Admin Phụ',
    defaultPassword: SHARED_ADMIN_PASSWORD,
    passwordHint: 'Mật khẩu chung Admin: 123456',
  },
];

const REGISTERED_USERS_KEY = 'korean_registered_players_v2';
const CURRENT_SESSION_KEY = 'korean_active_session_user_v2';

export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const isMainAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return normalizeEmail(email) === normalizeEmail(MAIN_ADMIN_EMAIL);
};

export const isSubAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const norm = normalizeEmail(email);
  return DESIGNATED_ADMINS.some((admin) => admin.adminLevel === 'sub' && normalizeEmail(admin.email) === norm);
};

export const isDesignatedAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const norm = normalizeEmail(email);
  return DESIGNATED_ADMINS.some((admin) => normalizeEmail(admin.email) === norm);
};

export const getDesignatedAdminInfo = (email?: string | null): DesignatedAdminConfig | undefined => {
  if (!email) return undefined;
  const norm = normalizeEmail(email);
  return DESIGNATED_ADMINS.find((admin) => normalizeEmail(admin.email) === norm);
};

export const getAdminTitle = (email?: string | null): string => {
  if (!email) return 'Học viên';
  if (isMainAdminEmail(email)) return 'Admin Chính (Tổng Quản Trị)';
  if (isSubAdminEmail(email)) return 'Admin Phụ (Phó Quản Trị)';
  return 'Học viên';
};

/**
 * Ẩn Gmail của tất cả Admin không hiện trên hệ thống theo yêu cầu bảo mật
 */
export const getSafeDisplayEmail = (email?: string | null): string => {
  if (!email) return '';
  if (isDesignatedAdminEmail(email)) {
    return '🔒 Gmail Ban Quản Trị (Bảo mật)';
  }
  return email;
};

export const maskAdminEmail = (email?: string | null): string => {
  if (!email) return '';
  if (isDesignatedAdminEmail(email)) {
    return '🔒 Email Admin Đã Ẩn';
  }
  return email;
};

// Seed default accounts including the 4 designated Admins and a few sample players
const createInitialUsers = (): AppUser[] => {
  // Seed the 4 designated Admins with their distinct dedicated passwords
  const adminUsers: AppUser[] = DESIGNATED_ADMINS.map((admin, idx) => ({
    id: `admin-${idx + 1}`,
    name: admin.name,
    email: admin.email,
    avatar: admin.avatar,
    provider: 'gmail' as SocialAuthProvider,
    role: 'admin' as UserRole,
    adminLevel: admin.adminLevel,
    isServerAdmin: true,
    password: admin.defaultPassword,
    loggedInAt: 'Hôm nay',
    totalXp: admin.adminLevel === 'main' ? 5000 : 3500 + idx * 250,
    streak: admin.adminLevel === 'main' ? 30 : 15 + idx * 3,
    status: 'active',
    createdAt: '01/01/2026',
  }));

  // Seed sample learner accounts to demonstrate player management
  const sampleLearners: AppUser[] = [
    {
      id: 'student-1',
      name: 'Nguyễn Minh Quân',
      email: 'minhquan.kr@gmail.com',
      avatar: '👨‍🎓',
      provider: 'gmail',
      role: 'student',
      isServerAdmin: false,
      password: DEFAULT_STUDENT_PASSWORD,
      loggedInAt: 'Hôm qua',
      totalXp: 1420,
      streak: 6,
      status: 'active',
      createdAt: '15/02/2026',
    },
    {
      id: 'student-2',
      name: 'Phạm Thu Trang',
      email: 'thutrang.topik@gmail.com',
      avatar: '👩‍🎓',
      provider: 'gmail',
      role: 'student',
      isServerAdmin: false,
      password: DEFAULT_STUDENT_PASSWORD,
      loggedInAt: '2 ngày trước',
      totalXp: 980,
      streak: 4,
      status: 'active',
      createdAt: '20/02/2026',
    },
    {
      id: 'student-3',
      name: 'Hoàng Anh Tuấn',
      email: 'anhtuan99@gmail.com',
      avatar: '🧑‍💻',
      provider: 'gmail',
      role: 'student',
      isServerAdmin: false,
      password: DEFAULT_STUDENT_PASSWORD,
      loggedInAt: '5 ngày trước',
      totalXp: 620,
      streak: 1,
      status: 'active',
      createdAt: '01/03/2026',
    },
  ];

  return [...adminUsers, ...sampleLearners];
};

export const getRegisteredUsers = (): AppUser[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(REGISTERED_USERS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure the 4 designated admins are present and have admin rights, and everyone has a password
        let updated = false;
        const users = [...parsed];

        // Ensure every designated admin has common password '123456'
        users.forEach((u) => {
          if (isDesignatedAdminEmail(u.email)) {
            if (u.password !== SHARED_ADMIN_PASSWORD) {
              u.password = SHARED_ADMIN_PASSWORD;
              updated = true;
            }
          } else if (!u.password) {
            u.password = DEFAULT_STUDENT_PASSWORD;
            updated = true;
          }
        });

        DESIGNATED_ADMINS.forEach((adm) => {
          const existingIdx = users.findIndex(
            (u) => normalizeEmail(u.email) === normalizeEmail(adm.email)
          );
          if (existingIdx === -1) {
            users.unshift({
              id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: adm.name,
              email: adm.email,
              avatar: adm.avatar,
              provider: 'gmail',
              role: 'admin',
              adminLevel: adm.adminLevel,
              isServerAdmin: true,
              password: SHARED_ADMIN_PASSWORD,
              loggedInAt: 'Hôm nay',
              totalXp: adm.adminLevel === 'main' ? 5000 : 4200,
              streak: adm.adminLevel === 'main' ? 30 : 21,
              status: 'active',
              createdAt: '01/01/2026',
            });
            updated = true;
          } else {
            // Force admin rights, adminLevel, and common password 123456
            const existing = users[existingIdx];
            if (
              existing.role !== 'admin' ||
              !existing.isServerAdmin ||
              existing.adminLevel !== adm.adminLevel ||
              existing.avatar !== adm.avatar ||
              existing.password !== SHARED_ADMIN_PASSWORD
            ) {
              existing.role = 'admin';
              existing.isServerAdmin = true;
              existing.adminLevel = adm.adminLevel;
              existing.avatar = adm.avatar;
              existing.name = adm.name;
              existing.password = SHARED_ADMIN_PASSWORD;
              updated = true;
            }
          }
        });

        if (updated) {
          localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
        }
        return users;
      }
    }
  } catch (err) {
    console.error('Error reading registered users from localStorage:', err);
  }

  const initial = createInitialUsers();
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(initial));
  } catch (e) {
    console.error(e);
  }
  return initial;
};

export const saveRegisteredUsers = (users: AppUser[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving registered users to localStorage:', err);
  }
};

export const getCurrentUserSession = (): AppUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_SESSION_KEY);
    if (raw) {
      const user = JSON.parse(raw) as AppUser;
      // Refresh admin status and level if designated
      if (isDesignatedAdminEmail(user.email)) {
        user.role = 'admin';
        user.isServerAdmin = true;
        const adm = getDesignatedAdminInfo(user.email);
        if (adm) {
          user.adminLevel = adm.adminLevel;
          user.avatar = adm.avatar;
          user.name = adm.name;
          if (!user.password || user.password === 'admin123') {
            user.password = adm.defaultPassword;
          }
        }
      }
      return user;
    }
  } catch (e) {
    console.error('Error reading current user session:', e);
  }
  return null;
};

export const setCurrentUserSession = (user: AppUser | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  } catch (e) {
    console.error('Error saving current user session:', e);
  }
};

export const clearCurrentUserSession = (): void => {
  setCurrentUserSession(null);
};

/**
 * Register a new player account with Name, Gmail and Password.
 * Password is required for all accounts (minimum 6 characters).
 */
export const registerUser = (
  name: string,
  email: string,
  password?: string
): { success: boolean; user?: AppUser; error?: string } => {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const normEmail = normalizeEmail(trimmedEmail);
  const trimmedPassword = (password || '').trim();

  if (!trimmedName) {
    return { success: false, error: 'Vui lòng nhập họ và tên của bạn!' };
  }

  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    return { success: false, error: 'Vui lòng nhập địa chỉ Gmail hợp lệ (ví dụ: tenban@gmail.com)!' };
  }

  if (!trimmedPassword) {
    return { success: false, error: 'Vui lòng thiết lập mật khẩu đăng nhập!' };
  }

  if (trimmedPassword.length < 6) {
    return { success: false, error: 'Mật khẩu phải có độ dài tối thiểu từ 6 ký tự trở lên!' };
  }

  const allUsers = getRegisteredUsers();

  // Check duplicate Gmail
  const existingUser = allUsers.find((u) => normalizeEmail(u.email) === normEmail);
  if (existingUser) {
    return {
      success: false,
      error: `Gmail "${trimmedEmail}" đã được đăng ký trên hệ thống! Vui lòng chọn "Đăng nhập" hoặc sử dụng Gmail khác.`,
    };
  }

  const adminInfo = getDesignatedAdminInfo(normEmail);
  const isServerAdmin = !!adminInfo;
  const role: UserRole = isServerAdmin ? 'admin' : 'student';
  const adminLevel = adminInfo?.adminLevel;
  const finalName = adminInfo ? adminInfo.name : trimmedName;
  const avatar = adminInfo ? adminInfo.avatar : '🎓';

  const newUser: AppUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: finalName,
    email: trimmedEmail,
    avatar,
    provider: 'gmail',
    role,
    adminLevel,
    isServerAdmin,
    password: trimmedPassword,
    loggedInAt: 'Vừa xong',
    totalXp: 0,
    streak: 1,
    status: 'active',
    createdAt: new Date().toLocaleDateString('vi-VN'),
  };

  const updatedUsers = [newUser, ...allUsers];
  saveRegisteredUsers(updatedUsers);
  setCurrentUserSession(newUser);

  return { success: true, user: newUser };
};

/**
 * Login an existing user by Gmail and Password.
 * Password is required for all users!
 * Main Admin, Sub Admin and Students have distinct password validations.
 */
export const loginUser = (
  emailOrName: string,
  password?: string
): { success: boolean; user?: AppUser; error?: string } => {
  const query = emailOrName.trim();
  const norm = normalizeEmail(query);
  const trimmedPassword = (password || '').trim();

  if (!query) {
    return { success: false, error: 'Vui lòng nhập Gmail hoặc Tên người dùng!' };
  }

  if (!trimmedPassword) {
    return { success: false, error: 'Vui lòng nhập mật khẩu đăng nhập!' };
  }

  const allUsers = getRegisteredUsers();

  // Find by email match first, then by name match
  let user = allUsers.find((u) => normalizeEmail(u.email) === norm);
  if (!user) {
    user = allUsers.find((u) => u.name.trim().toLowerCase() === query.toLowerCase());
  }

  if (!user) {
    // If it's one of the designated admin emails that somehow wasn't found, auto-create
    const adminInfo = getDesignatedAdminInfo(norm);
    if (adminInfo) {
      const reg = registerUser(adminInfo.name, adminInfo.email, trimmedPassword || adminInfo.defaultPassword);
      if (reg.success && reg.user) {
        return { success: true, user: reg.user };
      }
    }
    return {
      success: false,
      error: `Không tìm thấy tài khoản với Gmail/Tên "${query}". Vui lòng đăng ký tài khoản mới!`,
    };
  }

  if (user.status === 'suspended') {
    return {
      success: false,
      error: 'Tài khoản của bạn đang bị khóa bởi Quản trị viên. Vui lòng liên hệ ban quản trị!',
    };
  }

  // Password Verification (All Admins share common password 123456):
  if (isDesignatedAdminEmail(user.email)) {
    const isMatch =
      trimmedPassword === '123456' ||
      trimmedPassword === user.password ||
      trimmedPassword === SHARED_ADMIN_PASSWORD;
    if (!isMatch) {
      return {
        success: false,
        error: 'Mật khẩu quản trị không chính xác! Mật khẩu chung của tất cả Admin là: 123456',
      };
    }
  } else {
    // Regular student
    const expectedPassword = user.password || DEFAULT_STUDENT_PASSWORD;
    if (trimmedPassword !== expectedPassword) {
      return {
        success: false,
        error: 'Mật khẩu không chính xác! Vui lòng kiểm tra và nhập lại.',
      };
    }
  }

  // If user didn't have password stored yet, sync it now
  if (!user.password) {
    user.password = trimmedPassword;
  }

  // Update loggedInAt & ensure admin role & level
  if (isDesignatedAdminEmail(user.email)) {
    user.role = 'admin';
    user.isServerAdmin = true;
    const adm = getDesignatedAdminInfo(user.email);
    if (adm) {
      user.adminLevel = adm.adminLevel;
      user.avatar = adm.avatar;
      user.name = adm.name;
    }
  }
  user.loggedInAt = 'Vừa xong';

  const updatedUsers = allUsers.map((u) => (u.id === user?.id ? user : u));
  saveRegisteredUsers(updatedUsers);
  setCurrentUserSession(user);

  return { success: true, user };
};

/**
 * Quick login for designated Admin with common password 123456.
 */
export const quickLoginAdmin = (
  adminEmail: string,
  passwordInput?: string
): { success: boolean; user?: AppUser; error?: string } => {
  const adminInfo = getDesignatedAdminInfo(adminEmail);
  if (!adminInfo) {
    return { success: false, error: 'Tài khoản này không nằm trong danh sách Quản trị viên!' };
  }

  const allUsers = getRegisteredUsers();
  let user = allUsers.find((u) => normalizeEmail(u.email) === normalizeEmail(adminEmail));

  const passwordToVerify = passwordInput ? passwordInput.trim() : SHARED_ADMIN_PASSWORD;

  return loginUser(adminEmail, passwordToVerify);
};

/**
 * Change user password
 */
export const changeUserPassword = (
  userId: string,
  oldPassword: string,
  newPassword: string
): { success: boolean; error?: string } => {
  const trimmedNew = newPassword.trim();
  const trimmedOld = oldPassword.trim();

  if (!trimmedOld) {
    return { success: false, error: 'Vui lòng nhập mật khẩu hiện tại!' };
  }

  if (!trimmedNew || trimmedNew.length < 6) {
    return { success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự!' };
  }

  const allUsers = getRegisteredUsers();
  const user = allUsers.find((u) => u.id === userId);
  if (!user) {
    return { success: false, error: 'Không tìm thấy tài khoản người dùng!' };
  }

  const fallbackOld = isMainAdminEmail(user.email)
    ? MAIN_ADMIN_DEFAULT_PASSWORD
    : isSubAdminEmail(user.email)
    ? (getDesignatedAdminInfo(user.email)?.defaultPassword || SUB_ADMIN_MASTER_PASSWORD)
    : DEFAULT_STUDENT_PASSWORD;

  const expectedOld = user.password || fallbackOld;
  if (trimmedOld !== expectedOld) {
    return { success: false, error: 'Mật khẩu hiện tại không đúng!' };
  }

  user.password = trimmedNew;
  const updatedUsers = allUsers.map((u) => (u.id === userId ? user : u));
  saveRegisteredUsers(updatedUsers);

  const current = getCurrentUserSession();
  if (current && current.id === userId) {
    current.password = trimmedNew;
    setCurrentUserSession(current);
  }

  return { success: true };
};

/**
 * Tự đặt mật khẩu mới cho tài khoản cá nhân qua Gmail hoặc Tên
 */
export const setPersonalPassword = (
  emailOrName: string,
  newPassword: string
): { success: boolean; error?: string; user?: AppUser } => {
  const query = emailOrName.trim();
  const norm = normalizeEmail(query);
  const trimmedNew = newPassword.trim();

  if (!query) {
    return { success: false, error: 'Vui lòng nhập Gmail hoặc Tên tài khoản!' };
  }
  if (!trimmedNew || trimmedNew.length < 6) {
    return { success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự!' };
  }

  const allUsers = getRegisteredUsers();
  let user = allUsers.find((u) => normalizeEmail(u.email) === norm);
  if (!user) {
    user = allUsers.find((u) => u.name.trim().toLowerCase() === query.toLowerCase());
  }

  if (!user) {
    return { success: false, error: 'Không tìm thấy tài khoản tương ứng trên hệ thống!' };
  }

  user.password = trimmedNew;
  const updatedUsers = allUsers.map((u) => (u.id === user?.id ? user : u));
  saveRegisteredUsers(updatedUsers);

  const current = getCurrentUserSession();
  if (current && current.id === user.id) {
    current.password = trimmedNew;
    setCurrentUserSession(current);
  }

  return { success: true, user };
};

/**
 * Admin action: Reset a player's password directly
 */
export const resetPlayerPassword = (
  playerId: string,
  newPassword: string
): { success: boolean; error?: string } => {
  const trimmedNew = newPassword.trim();
  if (!trimmedNew || trimmedNew.length < 6) {
    return { success: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự!' };
  }

  const allUsers = getRegisteredUsers();
  const target = allUsers.find((u) => u.id === playerId);
  if (!target) {
    return { success: false, error: 'Không tìm thấy người chơi!' };
  }

  target.password = trimmedNew;
  const updatedUsers = allUsers.map((u) => (u.id === playerId ? target : u));
  saveRegisteredUsers(updatedUsers);

  const current = getCurrentUserSession();
  if (current && current.id === playerId) {
    current.password = trimmedNew;
    setCurrentUserSession(current);
  }

  return { success: true };
};

/**
 * Admin action: Update player info or grant XP/Streak
 */
export const updatePlayer = (
  playerId: string,
  updates: Partial<AppUser>
): { success: boolean; users: AppUser[]; updatedUser?: AppUser } => {
  const allUsers = getRegisteredUsers();
  let updatedUser: AppUser | undefined;

  const newUsers = allUsers.map((u) => {
    if (u.id === playerId) {
      updatedUser = { ...u, ...updates };
      return updatedUser;
    }
    return u;
  });

  saveRegisteredUsers(newUsers);

  // If current session is this user, update session as well
  const current = getCurrentUserSession();
  if (current && current.id === playerId && updatedUser) {
    setCurrentUserSession(updatedUser);
  }

  return { success: true, users: newUsers, updatedUser };
};

/**
 * Admin action: Delete a player account.
 * Designated admins cannot be deleted.
 */
export const deletePlayer = (
  playerId: string
): { success: boolean; users: AppUser[]; error?: string } => {
  const allUsers = getRegisteredUsers();
  const target = allUsers.find((u) => u.id === playerId);

  if (!target) {
    return { success: false, users: allUsers, error: 'Không tìm thấy người chơi!' };
  }

  if (isMainAdminEmail(target.email)) {
    return {
      success: false,
      users: allUsers,
      error: 'Không thể xóa tài khoản của Admin Chính (Trần Bảo Ngọc)!',
    };
  }

  if (isDesignatedAdminEmail(target.email)) {
    return {
      success: false,
      users: allUsers,
      error: 'Không thể xóa tài khoản của Quản trị viên hệ thống!',
    };
  }

  const newUsers = allUsers.filter((u) => u.id !== playerId);
  saveRegisteredUsers(newUsers);

  return { success: true, users: newUsers };
};

// =========================================================================
// BÁO CÁO VÀ GỬI MẬT KHẨU ADMIN CHÍNH & PHỤ TỚI GMAIL (zApollo1990@gmail.com)
// =========================================================================

export interface AdminCredentialsReport {
  mainAdmin: {
    name: string;
    role: string;
    email: string;
    password: string;
  };
  subAdmins: Array<{
    name: string;
    role: string;
    email: string;
    password: string;
  }>;
  subAdminMasterPassword: string;
  generatedAt: string;
  sentTo: string;
}

/**
 * Lấy dữ liệu báo cáo mật khẩu độc quyền của Admin Chính và từng Admin Phụ
 */
export const getAdminCredentialsReport = (): AdminCredentialsReport => {
  const users = getRegisteredUsers();
  const mainUser = users.find((u) => isMainAdminEmail(u.email));
  const mainPass = mainUser?.password || MAIN_ADMIN_DEFAULT_PASSWORD;

  const subAdmins = DESIGNATED_ADMINS.filter((a) => a.adminLevel === 'sub').map((adm) => {
    const userObj = users.find((u) => normalizeEmail(u.email) === normalizeEmail(adm.email));
    return {
      name: adm.name,
      role: adm.titleVi,
      email: adm.email,
      password: userObj?.password || adm.defaultPassword,
    };
  });

  const now = new Date().toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
  });

  return {
    mainAdmin: {
      name: 'Trần Bảo Ngọc',
      role: 'Admin Chính (Tổng Quản Trị)',
      email: MAIN_ADMIN_EMAIL,
      password: mainPass,
    },
    subAdmins,
    subAdminMasterPassword: SUB_ADMIN_MASTER_PASSWORD,
    generatedAt: now,
    sentTo: MAIN_ADMIN_EMAIL,
  };
};

/**
 * Chuẩn bị tiêu đề và nội dung email gửi đến hòm thư Gmail
 */
export const formatCredentialsEmailText = (
  report: AdminCredentialsReport
): { subject: string; body: string } => {
  const subject = `[한국어 여정] BÁO CÁO MẬT KHẨU BAN QUẢN TRỊ (MẬT KHẨU CHUNG 123456) - ${report.generatedAt}`;
  const body = `Kính gửi Tổng Quản Trị Viên Trần Bảo Ngọc,

Hệ thống ứng dụng học tiếng Hàn "한국어 여정 (Hành trình tiếng Hàn)" trân trọng gửi tới bạn thông tin đăng nhập thống nhất của Ban Quản Trị:

==================================================
🔑 MẬT KHẨU ĐĂNG NHẬP CHUNG CHO TẤT CẢ CÁC ADMIN: 123456
==================================================
Tất cả các Quản trị viên (cả Admin Chính và Admin Phụ) đều sử dụng chung mật khẩu đăng nhập: 123456.

==================================================
👑 1. ADMIN CHÍNH (TỔNG QUẢN TRỊ - TOÀN QUYỀN CAO NHẤT)
==================================================
• Họ và tên: ${report.mainAdmin.name}
• Gmail quản trị: ${report.mainAdmin.email}
• Vai trò: ${report.mainAdmin.role}
• MẬT KHẨU ĐĂNG NHẬP: 123456
(Chỉ Admin Chính có toàn quyền bổ nhiệm, reset mật khẩu, xóa hoặc tạm khóa tài khoản).

==================================================
🛡️ 2. DANH SÁCH CÁC ADMIN PHỤ (PHÓ QUẢN TRỊ)
==================================================
${report.subAdmins
  .map(
    (adm, i) =>
      `[${i + 1}] ${adm.name}
   - Chức vụ: ${adm.role}
   - Gmail: ${adm.email}
   - Mật khẩu đăng nhập chung: 123456`
  )
  .join('\n\n')}

==================================================
🔒 LƯU Ý BẢO MẬT HỆ THỐNG:
1. Tất cả Quản trị viên đăng nhập thuận tiện, đồng bộ với mật khẩu chung: 123456.
2. Địa chỉ Gmail của toàn thể Ban Quản Trị đã được tự động che chắn/ẩn bảo mật trên toàn bộ giao diện công khai.
3. Phân cấp quyền lực vẫn giữ nguyên: Chỉ Admin Chính (Trần Bảo Ngọc) mới có quyền can thiệp cấp cao vào tài khoản và hệ thống.

Trân trọng,
Ban Kỹ Thuật Hệ Thống 한국어 여정`;

  return { subject, body };
};

/**
 * Gửi thông tin mật khẩu Ban Quản Trị về Gmail
 */
export const sendAdminCredentialsToGmail = async (
  targetEmail: string = MAIN_ADMIN_EMAIL
): Promise<{
  success: boolean;
  message: string;
  sentAt: string;
  mailtoUrl: string;
  webGmailUrl: string;
  report: AdminCredentialsReport;
}> => {
  const report = getAdminCredentialsReport();
  const { subject, body } = formatCredentialsEmailText(report);

  const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  const webGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    targetEmail
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  let backendMessage = `Đã gửi báo cáo bảo mật và mật khẩu Admin Chính & Admin Phụ tới ${targetEmail} thành công!`;
  let sentAt = report.generatedAt;

  try {
    const res = await fetch('/api/admin/send-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetEmail, report }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.message) backendMessage = data.message;
      if (data.sentAt) sentAt = data.sentAt;
    }
  } catch (e) {
    console.warn('Backend send API notice:', e);
  }

  return {
    success: true,
    message: backendMessage,
    sentAt,
    mailtoUrl,
    webGmailUrl,
    report,
  };
};
