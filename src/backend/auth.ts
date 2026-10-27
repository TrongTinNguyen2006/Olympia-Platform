import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { UserModel, IUser } from './models/User.js';

const USERS_FILE = path.join(process.cwd(), 'users_db.json');
const SESSIONS_FILE = path.join(process.cwd(), 'sessions_db.json');
const SETTINGS_FILE = path.join(process.cwd(), 'settings_db.json');
const ANNOUNCEMENTS_FILE = path.join(process.cwd(), 'announcements_db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'OLYMPIA_SECURE_AUTH_SECRET_2026_KEY';

export type UserStatus = 'ACTIVE' | 'PENDING' | 'BANNED';
export type UserRole = 'ADMIN' | 'USER';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  fullName: string;
  isEmailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpires?: number;
  status: UserStatus;
  role: UserRole;
  savedMatches?: Record<string, any>;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserSession {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: number;
  expiresAt: number;
}

export interface SystemSettings {
  approvalMode: 'AUTO' | 'MANUAL';
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowRegistration: boolean;
  updatedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'FEATURE' | 'UPDATE' | 'MAINTENANCE' | 'GENERAL';
  active: boolean;
  authorName?: string;
  createdAt: string;
}

// In-memory caches for fast performance
const memoryUsers = new Map<string, UserRecord>(); // key: lowercase email
const memorySessions = new Map<string, UserSession>(); // key: session token
const failedLoginAttempts = new Map<string, { count: number; lockUntil: number }>();

// Default system settings
let memorySettings: SystemSettings = {
  approvalMode: 'AUTO',
  maintenanceMode: false,
  maintenanceMessage: 'Hệ thống đang được nâng cấp bảo trì định kỳ. Quý vị vui lòng quay lại sau ít phút!',
  allowRegistration: true,
  updatedAt: new Date().toISOString()
};

// Announcements store
let memoryAnnouncements: Announcement[] = [
  {
    id: 'ann_welcome',
    title: 'Chào mừng đến với Nền tảng Điều phối Thi đấu Olympia Hub',
    content: 'Hệ thống đã cập nhật bộ công cụ điều phối thi đấu thế hệ mới, hỗ trợ 8+ vòng thi đấu với độ trễ thấp và âm thanh/media truyền hình chuẩn!',
    type: 'FEATURE',
    active: true,
    authorName: 'Ban Quản Trị',
    createdAt: new Date().toISOString()
  }
];

// Hydrate users from local file
if (fs.existsSync(USERS_FILE)) {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    for (const [email, u] of Object.entries(parsed)) {
      const user = u as UserRecord;
      // Backwards compatibility for status
      if (!user.status) {
        user.status = 'ACTIVE';
      }
      if (!user.role) {
        user.role = 'USER';
      }
      memoryUsers.set(email.toLowerCase(), user);
    }
    console.log(`👤 Loaded ${memoryUsers.size} users from users_db.json`);
  } catch (e) {
    console.error('Error loading users_db.json:', e);
  }
}

// Hydrate sessions from local file
if (fs.existsSync(SESSIONS_FILE)) {
  try {
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    for (const [token, session] of Object.entries(parsed)) {
      if ((session as UserSession).expiresAt > Date.now()) {
        memorySessions.set(token, session as UserSession);
      }
    }
    console.log(`🔑 Loaded ${memorySessions.size} active sessions from sessions_db.json`);
  } catch (e) {
    console.error('Error loading sessions_db.json:', e);
  }
}

// Hydrate settings
if (fs.existsSync(SETTINGS_FILE)) {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    memorySettings = { ...memorySettings, ...parsed };
    console.log(`⚙️ Loaded system settings: approvalMode=${memorySettings.approvalMode}, maintenance=${memorySettings.maintenanceMode}`);
  } catch (e) {
    console.error('Error loading settings_db.json:', e);
  }
}

// Hydrate announcements
if (fs.existsSync(ANNOUNCEMENTS_FILE)) {
  try {
    const raw = fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryAnnouncements = parsed;
    }
    console.log(`📢 Loaded ${memoryAnnouncements.length} announcements from announcements_db.json`);
  } catch (e) {
    console.error('Error loading announcements_db.json:', e);
  }
}

// Seed Super Admin if none exists or ensure clean admin state
seedInitialAdmin();

export function resetOrEnsureAdmin(
  email: string,
  password = 'Admin@123456',
  fullName = 'Quản Trị Viên Hệ Thống (Super Admin)'
): UserRecord {
  const normalized = email.toLowerCase().trim();
  const { hash, salt } = hashPassword(password);
  const existing = memoryUsers.get(normalized);
  
  const adminUser: UserRecord = {
    id: existing?.id || `usr_admin_${Buffer.from(normalized).toString('hex').substring(0, 10)}`,
    email: normalized,
    passwordHash: hash,
    passwordSalt: salt,
    fullName: existing?.fullName && existing.fullName !== 'Quản Trị Viên Hệ Thống (Super Admin)' ? existing.fullName : fullName,
    isEmailVerified: true,
    status: 'ACTIVE',
    role: 'ADMIN',
    savedMatches: existing?.savedMatches || {},
    createdAt: existing?.createdAt || new Date().toISOString(),
    lastLoginAt: existing?.lastLoginAt
  };
  
  memoryUsers.set(normalized, adminUser);
  clearFailedAttempts(normalized);
  persistUsers();
  console.log(`👑 Super Admin account ready & reset: ${normalized} / ${password} (Role: ADMIN, Status: ACTIVE)`);
  return adminUser;
}

function seedInitialAdmin() {
  const defaultAdminEmails = [
    'admin@olympia.vn',
    '105726000.trongtin@gmail.com',
    'admin@gmail.com'
  ];
  
  if (process.env.ADMIN_EMAIL) {
    defaultAdminEmails.push(process.env.ADMIN_EMAIL.toLowerCase().trim());
  }

  for (const email of defaultAdminEmails) {
    const isTrongTin = email.includes('trongtin');
    resetOrEnsureAdmin(
      email,
      'Admin@123456',
      isTrongTin ? 'Trọng Tín (Super Admin)' : 'Quản Trị Viên Hệ Thống (Super Admin)'
    );
  }
}

function persistUsers() {
  try {
    const obj: Record<string, UserRecord> = {};
    for (const [k, v] of memoryUsers.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(obj, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write users_db.json:', e);
  }
}

function persistSessions() {
  try {
    const obj: Record<string, UserSession> = {};
    for (const [k, v] of memorySessions.entries()) {
      if (v.expiresAt > Date.now()) {
        obj[k] = v;
      }
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write sessions_db.json:', e);
  }
}

function persistSettings() {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(memorySettings, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write settings_db.json:', e);
  }
}

function persistAnnouncements() {
  try {
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(memoryAnnouncements, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write announcements_db.json:', e);
  }
}

// Password hashing
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 12000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.pbkdf2Sync(password, salt, 12000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(checkHash), Buffer.from(hash));
}

// Brute force protection
export function checkBruteForce(email: string): { locked: boolean; remainingSec?: number } {
  const key = email.toLowerCase().trim();
  const record = failedLoginAttempts.get(key);
  if (!record) return { locked: false };
  
  if (record.lockUntil > Date.now()) {
    const remainingSec = Math.ceil((record.lockUntil - Date.now()) / 1000);
    return { locked: true, remainingSec };
  }
  
  // If lock time passed, reset
  if (record.lockUntil > 0 && record.lockUntil <= Date.now()) {
    failedLoginAttempts.delete(key);
  }
  return { locked: false };
}

export function recordFailedAttempt(email: string) {
  const key = email.toLowerCase().trim();
  const record = failedLoginAttempts.get(key) || { count: 0, lockUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockUntil = Date.now() + 15 * 60 * 1000; // 15-minute lockout on 5 consecutive failures
  }
  failedLoginAttempts.set(key, record);
}

export function clearFailedAttempts(email: string) {
  failedLoginAttempts.delete(email.toLowerCase().trim());
}

// Input validations
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự.' };
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, message: 'Mật khẩu phải chứa cả chữ cái và chữ số.' };
  }
  return { valid: true };
}

// Role Token Generator & Verifier for URL Obfuscation & Security
export function generateRoleToken(userId: string, role: string): string {
  const payload = `${userId}:${role}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ payload, signature })).toString('base64url');
}

export function verifyRoleToken(tokenStr: string, expectedRole?: string): { valid: boolean; userId?: string; role?: string } {
  try {
    if (!tokenStr) return { valid: false };
    const raw = Buffer.from(tokenStr, 'base64url').toString('utf8');
    const { payload, signature } = JSON.parse(raw);
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
    
    if (signature === expectedSignature) {
      const [userId, role, timestamp] = payload.split(':');
      // Token valid for 30 days
      if (Date.now() - Number(timestamp) > 30 * 24 * 3600 * 1000) {
        return { valid: false };
      }
      if (expectedRole && expectedRole !== role && role !== 'ADMIN') {
        return { valid: false };
      }
      return { valid: true, userId, role };
    }
  } catch (e) {
    // Malformed token
  }
  return { valid: false };
}

// User Record Database methods
export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalized = email.toLowerCase().trim();
  
  // 1. Check memory cache
  if (memoryUsers.has(normalized)) {
    return memoryUsers.get(normalized)!;
  }
  
  // 2. Check MongoDB if connected
  if (process.env.MONGO_URI && UserModel.db?.readyState === 1) {
    try {
      const dbUser = await (UserModel as any).findOne({ email: normalized });
      if (dbUser) {
        const record: UserRecord = {
          id: dbUser.id,
          email: dbUser.email,
          passwordHash: dbUser.passwordHash,
          passwordSalt: dbUser.passwordSalt,
          fullName: dbUser.fullName,
          isEmailVerified: dbUser.isEmailVerified,
          emailVerificationCode: dbUser.emailVerificationCode,
          emailVerificationExpires: dbUser.emailVerificationExpires,
          status: dbUser.status || 'ACTIVE',
          role: dbUser.role || 'USER',
          savedMatches: dbUser.savedMatches || {},
          createdAt: dbUser.createdAt?.toISOString() || new Date().toISOString(),
          lastLoginAt: dbUser.lastLoginAt?.toISOString()
        };
        memoryUsers.set(normalized, record);
        persistUsers();
        return record;
      }
    } catch (e) {
      console.error('Error querying user from MongoDB:', e);
    }
  }
  return null;
}

export function findUserByEmailSync(email: string): UserRecord | null {
  const normalized = email.toLowerCase().trim();
  return memoryUsers.get(normalized) || null;
}

export async function createUser(data: {
  email: string;
  password: string;
  fullName: string;
}): Promise<{ user: UserRecord; verificationCode: string }> {
  const normalizedEmail = data.email.toLowerCase().trim();
  const { hash, salt } = hashPassword(data.password);
  
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  // Determine initial status based on approval mode
  const initialStatus: UserStatus = memorySettings.approvalMode === 'AUTO' ? 'ACTIVE' : 'PENDING';

  const userRecord: UserRecord = {
    id: userId,
    email: normalizedEmail,
    passwordHash: hash,
    passwordSalt: salt,
    fullName: data.fullName.trim(),
    isEmailVerified: false,
    emailVerificationCode: verificationCode,
    emailVerificationExpires: Date.now() + 24 * 3600 * 1000, // 24 hours
    status: initialStatus,
    role: 'USER',
    createdAt: new Date().toISOString()
  };

  // Save memory cache & file
  memoryUsers.set(normalizedEmail, userRecord);
  persistUsers();

  // Persist to MongoDB if connected
  if (process.env.MONGO_URI && UserModel.db?.readyState === 1) {
    try {
      await UserModel.create({
        id: userId,
        email: normalizedEmail,
        passwordHash: hash,
        passwordSalt: salt,
        fullName: data.fullName.trim(),
        isEmailVerified: false,
        emailVerificationCode: verificationCode,
        emailVerificationExpires: userRecord.emailVerificationExpires,
        status: initialStatus,
        role: 'USER'
      });
    } catch (e) {
      console.error('Error persisting new user to MongoDB:', e);
    }
  }

  return { user: userRecord, verificationCode };
}

export async function verifyUserEmail(email: string, code: string): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(normalizedEmail);
  
  if (!user) {
    return { success: false, message: 'Tài khoản không tồn tại trên hệ thống.' };
  }
  if (user.isEmailVerified) {
    return { success: true, message: 'Email đã được xác thực trước đó.' };
  }
  if (user.emailVerificationCode !== code.trim()) {
    return { success: false, message: 'Mã xác thực 6 chữ số không chính xác.' };
  }
  if (user.emailVerificationExpires && user.emailVerificationExpires < Date.now()) {
    return { success: false, message: 'Mã xác thực đã hết hạn (24 giờ). Vui lòng yêu cầu mã mới.' };
  }

  // Update user verified state
  user.isEmailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  
  memoryUsers.set(normalizedEmail, user);
  persistUsers();

  if (process.env.MONGO_URI && UserModel.db?.readyState === 1) {
    try {
      await (UserModel as any).updateOne({ email: normalizedEmail }, {
        isEmailVerified: true,
        $unset: { emailVerificationCode: 1, emailVerificationExpires: 1 }
      });
    } catch (e) {
      console.error('Error updating MongoDB user email verification status:', e);
    }
  }

  return { success: true, message: 'Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.' };
}

export function createSession(user: UserRecord): UserSession {
  const token = `sess_${crypto.randomBytes(24).toString('hex')}`;
  const session: UserSession = {
    token,
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 3600 * 1000 // 30 days
  };
  memorySessions.set(token, session);
  persistSessions();

  // Update last login
  user.lastLoginAt = new Date().toISOString();
  memoryUsers.set(user.email.toLowerCase(), user);
  persistUsers();

  return session;
}

export function getSession(token: string): UserSession | null {
  if (!token) return null;
  const session = memorySessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    memorySessions.delete(token);
    persistSessions();
    return null;
  }
  return session;
}

export function destroySession(token: string) {
  memorySessions.delete(token);
  persistSessions();
}

export function findUserById(userId: string): UserRecord | null {
  if (!userId) return null;
  for (const u of memoryUsers.values()) {
    if (u.id === userId) return u;
  }
  return null;
}

export function saveUserMatch(userIdOrEmail: string, match: any): boolean {
  if (!userIdOrEmail || !match || !match.matchCode) return false;
  let user: UserRecord | undefined = memoryUsers.get(userIdOrEmail.toLowerCase().trim());
  if (!user) {
    for (const u of memoryUsers.values()) {
      if (u.id === userIdOrEmail) {
        user = u;
        break;
      }
    }
  }
  if (!user) return false;
  if (!user.savedMatches) {
    user.savedMatches = {};
  }
  const code = (match.matchCode || '').trim().toUpperCase();
  if (!code) return false;
  const enrichedMatch = {
    ...match,
    matchCode: code,
    userId: user.id,
    ownerEmail: user.email,
    ownerName: user.fullName,
    updatedAt: new Date().toISOString()
  };
  user.savedMatches[code] = enrichedMatch;
  memoryUsers.set(user.email.toLowerCase(), user);
  persistUsers();
  
  if (process.env.MONGO_URI && UserModel.db?.readyState === 1) {
    (UserModel as any).updateOne(
      { email: user.email.toLowerCase() },
      { $set: { [`savedMatches.${code}`]: enrichedMatch } }
    ).catch((err: any) => console.error('Error saving user match to MongoDB:', err));
  }
  return true;
}

export function deleteUserMatch(userIdOrEmail: string, matchCode: string): boolean {
  if (!matchCode) return false;
  const code = matchCode.trim().toUpperCase();
  let deletedAny = false;

  if (userIdOrEmail) {
    let user: UserRecord | undefined = memoryUsers.get(userIdOrEmail.toLowerCase().trim());
    if (!user) {
      for (const u of memoryUsers.values()) {
        if (u.id === userIdOrEmail || u.email.toLowerCase() === userIdOrEmail.toLowerCase().trim()) {
          user = u;
          break;
        }
      }
    }
    if (user && user.savedMatches && user.savedMatches[code]) {
      delete user.savedMatches[code];
      memoryUsers.set(user.email.toLowerCase(), user);
      deletedAny = true;
    }
  }

  // Also sweep all users to ensure this match code is removed completely
  for (const u of memoryUsers.values()) {
    if (u.savedMatches && u.savedMatches[code]) {
      delete u.savedMatches[code];
      memoryUsers.set(u.email.toLowerCase(), u);
      deletedAny = true;
    }
  }

  persistUsers();

  if (process.env.MONGO_URI && UserModel.db?.readyState === 1) {
    (UserModel as any).updateMany(
      {},
      { $unset: { [`savedMatches.${code}`]: 1 } }
    ).catch((err: any) => console.error('Error deleting user match from MongoDB:', err));
  }
  return deletedAny;
}

export function getUserMatches(userIdOrEmail: string): any[] {
  if (!userIdOrEmail) return [];
  let user: UserRecord | undefined = memoryUsers.get(userIdOrEmail.toLowerCase().trim());
  if (!user) {
    for (const u of memoryUsers.values()) {
      if (u.id === userIdOrEmail) {
        user = u;
        break;
      }
    }
  }
  if (!user || !user.savedMatches) return [];
  return Object.values(user.savedMatches);
}

export function getUserMatchByCode(userIdOrEmail: string, matchCode: string): any | null {
  if (!userIdOrEmail || !matchCode) return null;
  let user: UserRecord | undefined = memoryUsers.get(userIdOrEmail.toLowerCase().trim());
  if (!user) {
    for (const u of memoryUsers.values()) {
      if (u.id === userIdOrEmail) {
        user = u;
        break;
      }
    }
  }
  if (!user || !user.savedMatches) return null;
  const code = matchCode.trim().toUpperCase();
  return user.savedMatches[code] || null;
}

export function getAllUserMatches(): Record<string, any> {
  const all: Record<string, any> = {};
  for (const user of memoryUsers.values()) {
    if (user.savedMatches) {
      for (const [code, match] of Object.entries(user.savedMatches)) {
        all[code] = match;
      }
    }
  }
  return all;
}

// --- SUPER ADMIN MANAGEMENT METHODS ---

export function getAllUsersSafe() {
  const usersList: any[] = [];
  for (const u of memoryUsers.values()) {
    usersList.push({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      isEmailVerified: u.isEmailVerified,
      status: u.status || 'ACTIVE',
      role: u.role || 'USER',
      savedMatchesCount: u.savedMatches ? Object.keys(u.savedMatches).length : 0,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt
    });
  }
  return usersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updateUserStatus(userId: string, newStatus: UserStatus): boolean {
  const user = findUserById(userId);
  if (!user) return false;
  user.status = newStatus;
  memoryUsers.set(user.email.toLowerCase(), user);
  persistUsers();
  return true;
}

export function updateUserRole(userId: string, newRole: UserRole): boolean {
  const user = findUserById(userId);
  if (!user) return false;
  user.role = newRole;
  memoryUsers.set(user.email.toLowerCase(), user);
  persistUsers();
  return true;
}

export function updateUserProfile(userId: string, data: { fullName?: string; email?: string; status?: UserStatus; role?: UserRole }): boolean {
  const user = findUserById(userId);
  if (!user) return false;
  if (data.fullName) user.fullName = data.fullName.trim();
  if (data.status) user.status = data.status;
  if (data.role) user.role = data.role;
  memoryUsers.set(user.email.toLowerCase(), user);
  persistUsers();
  return true;
}

export function deleteUserById(userId: string): boolean {
  const user = findUserById(userId);
  if (!user) return false;
  memoryUsers.delete(user.email.toLowerCase());
  persistUsers();
  // Clear any active sessions
  for (const [token, session] of memorySessions.entries()) {
    if (session.userId === userId) {
      memorySessions.delete(token);
    }
  }
  persistSessions();
  return true;
}

export function getSystemSettings(): SystemSettings {
  return { ...memorySettings };
}

export function updateSystemSettings(newSettings: Partial<SystemSettings>): SystemSettings {
  memorySettings = {
    ...memorySettings,
    ...newSettings,
    updatedAt: new Date().toISOString()
  };
  persistSettings();
  return { ...memorySettings };
}

export function getAnnouncements(onlyActive = false): Announcement[] {
  if (onlyActive) {
    return memoryAnnouncements.filter(a => a.active);
  }
  return [...memoryAnnouncements];
}

export function createAnnouncement(data: {
  title: string;
  content: string;
  type?: 'FEATURE' | 'UPDATE' | 'MAINTENANCE' | 'GENERAL';
  authorName?: string;
}): Announcement {
  const announcement: Announcement = {
    id: `ann_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: data.title.trim(),
    content: data.content.trim(),
    type: data.type || 'GENERAL',
    active: true,
    authorName: data.authorName || 'Ban Quản Trị',
    createdAt: new Date().toISOString()
  };
  memoryAnnouncements.unshift(announcement);
  persistAnnouncements();
  return announcement;
}

export function deleteAnnouncement(id: string): boolean {
  const index = memoryAnnouncements.findIndex(a => a.id === id);
  if (index === -1) return false;
  memoryAnnouncements.splice(index, 1);
  persistAnnouncements();
  return true;
}

export function toggleAnnouncement(id: string, active?: boolean): boolean {
  const ann = memoryAnnouncements.find(a => a.id === id);
  if (!ann) return false;
  ann.active = active !== undefined ? active : !ann.active;
  persistAnnouncements();
  return true;
}
