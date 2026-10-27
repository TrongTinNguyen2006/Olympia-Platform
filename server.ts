import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';

import { connectDB } from './src/backend/config/db.js';
import { setupSocketHandlers } from './src/backend/socket/socketHandler.js';
import { GameManager } from './src/backend/socket/GameManager.js';
import { MatchModel } from './src/backend/models/Match.js';
import { DEFAULT_MOCK_MATCH } from './src/backend/config/seedData.js';
import { SocketEvent } from './src/types.js';
import {
  createUser,
  findUserByEmail,
  findUserByEmailSync,
  findUserById,
  verifyUserEmail,
  verifyPassword,
  checkBruteForce,
  recordFailedAttempt,
  clearFailedAttempts,
  validateEmail,
  validatePassword,
  createSession,
  getSession,
  destroySession,
  generateRoleToken,
  verifyRoleToken,
  saveUserMatch,
  deleteUserMatch,
  getUserMatches,
  getUserMatchByCode,
  getAllUserMatches,
  getAllUsersSafe,
  updateUserStatus,
  updateUserRole,
  updateUserProfile,
  deleteUserById,
  getSystemSettings,
  updateSystemSettings,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  toggleAnnouncement,
  resetOrEnsureAdmin
} from './src/backend/auth.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Setup Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DB_FILE = path.join(process.cwd(), 'matches_db.json');
const memoryMatches = new Map<string, any>();

// Load from local file if exists
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    for (const [k, v] of Object.entries(parsed)) {
      memoryMatches.set(k, v);
    }
    console.log(`Loaded ${memoryMatches.size} match codes from local DB file.`);
  } catch (e) {
    console.error('Error loading matches_db.json:', e);
  }
}

// Hydrate all user-saved matches from users database into memory
try {
  const userMatches = getAllUserMatches();
  for (const [code, match] of Object.entries(userMatches)) {
    memoryMatches.set(code, match);
  }
  console.log(`👤 Hydrated ${Object.keys(userMatches).length} user-saved matches from registered user accounts.`);
} catch (e) {
  console.error('Error hydrating user matches on boot:', e);
}

// Helper to extract authenticated user from request
const getRequestUser = (req: express.Request) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.query.token as string || req.body?.token);
  if (token) {
    const session = getSession(token);
    if (session) return session;
  }
  const emailParam = (req.query.email as string || req.body?.userEmail || req.headers['x-user-email'] as string);
  if (emailParam) {
    const userRec = findUserByEmailSync(emailParam);
    if (userRec) return { userId: userRec.id, email: userRec.email, fullName: userRec.fullName, role: userRec.role };
  }
  return null;
};

// Helper to construct a blank structured match
const createBlankMatch = (code: string, matchName?: string) => {
  return {
    matchCode: code,
    matchName: matchName || `Bộ đề ${code}`,
    matchPassword: '123',
    khoi_dong: {
      cau_hoi: Array.from({ length: 36 }, (_, i) => ({
        id: `KD_${i + 1}`,
        noi_dung: '',
        dap_an_dung: '',
        chu_thich: ''
      }))
    },
    vuot_chuong_ngai_vat: {
      tu_khoa_chinh: '',
      anh_goc_url: 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a?w=800',
      hang_ngang: Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        cau_hoi: '',
        dap_an: '',
        so_ky_tu: 5
      }))
    },
    tang_toc: {
      cau_hoi: Array.from({ length: 4 }, (_, i) => ({
        id: i + 1,
        noi_dung: '',
        dap_an_dung: '',
        thoi_gian: i < 2 ? 20 : 30
      }))
    },
    ve_dich: {
      cau_hoi: Array.from({ length: 24 }, (_, i) => ({
        id: `VD_${i + 1}`,
        noi_dung: '',
        dap_an_dung: '',
        muc_diem: i % 2 === 0 ? 20 : 30,
        linh_vuc: 'Khoa học tổng hợp'
      }))
    },
    cau_hoi_phu: {
      cau_hoi: Array.from({ length: 3 }, (_, i) => ({
        id: i + 1,
        noi_dung: '',
        dap_an_dung: ''
      }))
    },
    dau_tri: {
      cau_hoi: Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        noi_dung: '',
        dap_an_dung: '',
        chu_thich: '',
        goi_thuong: {
          chu_de: `Chủ đề thưởng ${i + 1}`,
          cau_hoi: [
            { id: `${i + 1}_1`, noi_dung: '', dap_an_dung: '' },
            { id: `${i + 1}_2`, noi_dung: '', dap_an_dung: '' },
            { id: `${i + 1}_3`, noi_dung: '', dap_an_dung: '' }
          ]
        }
      }))
    }
  };
};

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// --- AUTHENTICATION & SECURITY ENDPOINTS ---

// Helper middleware to check Admin authorization
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const user = getRequestUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Yêu cầu quyền Quản Trị Viên (Super Admin) để thực hiện thao tác này.' });
  }
  next();
};

// Public System Config endpoint
app.get('/api/system/public-config', (req, res) => {
  try {
    const settings = getSystemSettings();
    const announcements = getAnnouncements(true);
    return res.json({
      success: true,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      allowRegistration: settings.allowRegistration,
      announcements
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const settings = getSystemSettings();
    if (!settings.allowRegistration) {
      return res.status(403).json({ success: false, message: 'Hệ thống đang tạm thời đóng cổng đăng ký thành viên mới.' });
    }

    const { email, password, fullName } = req.body || {};

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ email, mật khẩu và họ tên.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Địa chỉ email không đúng định dạng chuẩn.' });
    }

    const passValidation = validatePassword(password);
    if (!passValidation.valid) {
      return res.status(400).json({ success: false, message: passValidation.message });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email này đã được đăng ký sử dụng trên hệ thống.' });
    }

    const { user, verificationCode } = await createUser({ email, password, fullName });

    return res.json({
      success: true,
      message: 'Đăng ký thành công! Vui lòng nhập mã xác thực email (6 chữ số) để kích hoạt tài khoản.',
      email: user.email,
      verificationCode
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// Email verification endpoint
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mã xác thực.' });
    }

    const result = await verifyUserEmail(email, code);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// Login endpoint with Brute-Force protection & Role routing
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
    }

    // Anti brute-force check
    const bruteCheck = checkBruteForce(email);
    if (bruteCheck.locked) {
      return res.status(429).json({
        success: false,
        message: `Tài khoản tạm thời bị khóa do thử sai quá 5 lần. Vui lòng thử lại sau ${bruteCheck.remainingSec} giây.`
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      recordFailedAttempt(email);
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
    }

    const passwordValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!passwordValid) {
      recordFailedAttempt(email);
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        verificationCode: user.emailVerificationCode,
        message: 'Tài khoản chưa được xác thực email. Vui lòng nhập mã xác thực 6 chữ số.'
      });
    }

    // Check account status
    if (user.status === 'BANNED') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản này đã bị khóa hoặc tạm ngưng bởi Quản Trị Viên hệ thống.'
      });
    }

    if (user.status === 'PENDING') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đang trong trạng thái chờ Ban Quản Trị phê duyệt. Vui lòng liên hệ Quản Trị Viên.'
      });
    }

    // Check maintenance mode
    const systemSettings = getSystemSettings();
    if (systemSettings.maintenanceMode && user.role !== 'ADMIN') {
      return res.status(503).json({
        success: false,
        isMaintenance: true,
        message: systemSettings.maintenanceMessage || 'Hệ thống đang bảo trì, chỉ tài khoản Quản Trị Viên mới có quyền đăng nhập.'
      });
    }

    // Clear failed login count on successful login
    clearFailedAttempts(email);

    // Create session
    const session = createSession(user);

    // Generate account-scoped role tokens for role links
    const roleTokens = {
      ADMIN: generateRoleToken(user.id, 'ADMIN'),
      KHO_DE: generateRoleToken(user.id, 'KHO_DE'),
      MC: generateRoleToken(user.id, 'MC'),
      PLAYER: generateRoleToken(user.id, 'PLAYER'),
      VIEWER: generateRoleToken(user.id, 'VIEWER'),
      OVERLAY: generateRoleToken(user.id, 'OVERLAY'),
      BANG_DIEM: generateRoleToken(user.id, 'BANG_DIEM'),
      SCOREBOARD: generateRoleToken(user.id, 'BANG_DIEM')
    };

    return res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token: session.token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status
      },
      roleTokens
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// Reset / Re-issue Admin Account endpoint
app.post('/api/auth/reset-admin', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const targetEmail = (email || 'admin@olympia.vn').toLowerCase().trim();
    const newPassword = password || 'Admin@123456';
    const isTrongTin = targetEmail.includes('trongtin');

    const adminUser = resetOrEnsureAdmin(
      targetEmail,
      newPassword,
      isTrongTin ? 'Trọng Tín (Super Admin)' : 'Quản Trị Viên Hệ Thống (Super Admin)'
    );

    return res.json({
      success: true,
      message: `Đã cấp lại & làm mới thông tin tài khoản Quản Trị Viên: ${targetEmail}`,
      email: targetEmail,
      defaultPassword: newPassword,
      role: 'ADMIN',
      status: 'ACTIVE'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// Current user profile
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.query.token as string);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Chưa đăng nhập.' });
  }

  const session = getSession(token);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.' });
  }

  const user = findUserById(session.userId);

  const roleTokens = {
    ADMIN: generateRoleToken(session.userId, 'ADMIN'),
    KHO_DE: generateRoleToken(session.userId, 'KHO_DE'),
    MC: generateRoleToken(session.userId, 'MC'),
    PLAYER: generateRoleToken(session.userId, 'PLAYER'),
    VIEWER: generateRoleToken(session.userId, 'VIEWER'),
    OVERLAY: generateRoleToken(session.userId, 'OVERLAY'),
    BANG_DIEM: generateRoleToken(session.userId, 'BANG_DIEM'),
    SCOREBOARD: generateRoleToken(session.userId, 'BANG_DIEM')
  };

  return res.json({
    success: true,
    user: {
      id: session.userId,
      email: session.email,
      fullName: session.fullName,
      role: session.role,
      status: user?.status || 'ACTIVE'
    },
    roleTokens
  });
});

// Logout endpoint with session termination broadcast
app.post('/api/auth/logout', (req, res) => {
  const { token } = req.body || {};
  if (token) {
    destroySession(token);
    try {
      // Broadcast session termination to disconnect connected clients
      io.emit(SocketEvent.SESSION_TERMINATED, {
        message: 'Phiên thi đấu đã kết thúc do Người điều khiển (Host) đã đăng xuất.'
      });
    } catch (e) {
      console.error('Error broadcasting session termination on logout:', e);
    }
  }
  return res.json({ success: true, message: 'Đã đăng xuất thành công.' });
});

// --- CONTROLLER LOAD MATCH PACKAGE ENDPOINT ---
app.post('/api/controller/load-match-package', async (req, res) => {
  try {
    const { matchCode, matchPassword } = req.body || {};
    if (!matchCode) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập Mã đề thi.' });
    }

    const code = matchCode.trim().toUpperCase();
    let matchObj = memoryMatches.get(code);

    if (!matchObj && process.env.MONGO_URI && MatchModel.db?.readyState === 1) {
      matchObj = await (MatchModel as any).findOne({ matchCode: code });
      if (matchObj && matchObj.toObject) matchObj = matchObj.toObject();
    }

    if (!matchObj) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bộ đề có mã "${code}" trong kho dữ liệu. Vui lòng kiểm tra lại mã đề!`
      });
    }

    const expectedPassword = matchObj.matchPassword || '123';
    if (matchPassword !== expectedPassword) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu bộ đề không chính xác! Vui lòng nhập đúng mật khẩu đã đặt khi tạo đề.'
      });
    }

    // Reset and initialize entire game state with the new match questions
    const manager = GameManager.getInstance();
    manager.initGame(code, matchObj);

    // Sync to all socket clients
    io.emit(SocketEvent.STATE_SYNC, manager.getMatchState());
    io.emit(SocketEvent.MATCH_QUESTIONS_UPDATED, {
      matchCode: code,
      matchQuestions: manager.getMatchQuestions()
    });

    const counts = {
      khoiDongCount: matchObj.khoi_dong?.cau_hoi?.length || 0,
      vcnvCount: matchObj.vuot_chuong_ngai_vat?.hang_ngang?.length || 0,
      tangTocCount: matchObj.tang_toc?.cau_hoi?.length || 0,
      veDichCount: matchObj.ve_dich?.cau_hoi?.length || 0,
      cauHoiPhuCount: matchObj.cau_hoi_phu?.cau_hoi?.length || 0
    };

    return res.json({
      success: true,
      message: `Nạp thành công bộ đề "${code}" vào phiên thi đấu! Đề thi cũ đã được thay thế.`,
      matchCode: code,
      counts
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// Update Tournament Name via REST API
app.post('/api/controller/update-tournament-name', async (req, res) => {
  try {
    const { tournamentName } = req.body || {};
    const manager = GameManager.getInstance();
    manager.setTournamentName(tournamentName);
    io.emit(SocketEvent.STATE_SYNC, manager.getMatchState());
    return res.json({
      success: true,
      tournamentName: manager.getMatchState().tournamentName
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// --- SUPER ADMIN MANAGEMENT ENDPOINTS ---

// 1. Telemetry / Stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  try {
    const allUsers = getAllUsersSafe();
    const activeUsers = allUsers.filter(u => u.status === 'ACTIVE').length;
    const pendingUsers = allUsers.filter(u => u.status === 'PENDING').length;
    const bannedUsers = allUsers.filter(u => u.status === 'BANNED').length;
    const adminUsers = allUsers.filter(u => u.role === 'ADMIN').length;

    const memoryUsage = process.memoryUsage();
    const manager = GameManager.getInstance();
    const currentState = manager.getMatchState();

    return res.json({
      success: true,
      stats: {
        users: {
          total: allUsers.length,
          active: activeUsers,
          pending: pendingUsers,
          banned: bannedUsers,
          admins: adminUsers
        },
        matches: {
          totalLoadedInMem: memoryMatches.size,
          activeMatchCode: currentState.matchCode,
          currentRound: currentState.currentRound
        },
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          uptimeSeconds: Math.floor(process.uptime()),
          memory: {
            rssMb: Math.round(memoryUsage.rss / (1024 * 1024)),
            heapUsedMb: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
            heapTotalMb: Math.round(memoryUsage.heapTotal / (1024 * 1024))
          },
          socketClientsCount: io.engine.clientsCount || 0
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 2. User list
app.get('/api/admin/users', requireAdmin, (req, res) => {
  try {
    const users = getAllUsersSafe();
    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 3. User status update (Approve, Ban, Activate)
app.post('/api/admin/users/status', requireAdmin, (req, res) => {
  try {
    const { userId, status } = req.body || {};
    if (!userId || !status) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin userId hoặc status.' });
    }
    const ok = updateUserStatus(userId, status);
    if (!ok) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    return res.json({ success: true, message: `Đã cập nhật trạng thái tài khoản thành ${status}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 4. User role update (Admin / User)
app.post('/api/admin/users/role', requireAdmin, (req, res) => {
  try {
    const { userId, role } = req.body || {};
    if (!userId || !role) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin userId hoặc role.' });
    }
    const ok = updateUserRole(userId, role);
    if (!ok) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    return res.json({ success: true, message: `Đã cập nhật quyền tài khoản thành ${role}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 5. User profile details update
app.post('/api/admin/users/update', requireAdmin, (req, res) => {
  try {
    const { userId, fullName, email, status, role } = req.body || {};
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin userId.' });
    }
    const ok = updateUserProfile(userId, { fullName, email, status, role });
    if (!ok) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    return res.json({ success: true, message: 'Đã lưu cập nhật thông tin tài khoản.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 6. Delete user
app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  try {
    const userId = req.params.id;
    const ok = deleteUserById(userId);
    if (!ok) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản để xóa.' });
    return res.json({ success: true, message: 'Đã xóa tài khoản khỏi hệ thống.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 7. System Settings
app.get('/api/admin/settings', requireAdmin, (req, res) => {
  try {
    const settings = getSystemSettings();
    return res.json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

app.post('/api/admin/settings', requireAdmin, (req, res) => {
  try {
    const { approvalMode, maintenanceMode, maintenanceMessage, allowRegistration } = req.body || {};
    const updated = updateSystemSettings({
      approvalMode,
      maintenanceMode,
      maintenanceMessage,
      allowRegistration
    });
    return res.json({ success: true, message: 'Đã lưu cấu hình hệ thống thành công!', settings: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// 8. System Announcements
app.get('/api/admin/announcements', requireAdmin, (req, res) => {
  try {
    const announcements = getAnnouncements(false);
    return res.json({ success: true, announcements });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

app.post('/api/admin/announcements', requireAdmin, (req, res) => {
  try {
    const { title, content, type } = req.body || {};
    const user = getRequestUser(req);
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo.' });
    }
    const announcement = createAnnouncement({
      title,
      content,
      type,
      authorName: user?.fullName || 'Quản Trị Viên'
    });
    return res.json({ success: true, message: 'Đã phát hành thông báo mới thành công!', announcement });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

app.delete('/api/admin/announcements/:id', requireAdmin, (req, res) => {
  try {
    const ok = deleteAnnouncement(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo.' });
    return res.json({ success: true, message: 'Đã xóa thông báo.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

app.post('/api/admin/announcements/:id/toggle', requireAdmin, (req, res) => {
  try {
    const ok = toggleAnnouncement(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo.' });
    return res.json({ success: true, message: 'Đã thay đổi trạng thái hiển thị thông báo.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// Public System Config & Announcements (Accessible by landing page and all clients)
app.get('/api/system/public-config', (req, res) => {
  try {
    const settings = getSystemSettings();
    const announcements = getAnnouncements(true);
    return res.json({
      success: true,
      maintenanceMode: Boolean(settings.maintenanceMode),
      maintenanceMessage: settings.maintenanceMessage || '',
      allowRegistration: settings.allowRegistration !== false,
      announcements: announcements || []
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      maintenanceMode: false,
      maintenanceMessage: '',
      allowRegistration: true,
      announcements: [],
      message: (error as Error).message
    });
  }
});

// Verify Match Password endpoint
app.post('/api/match/verify-password', async (req, res) => {
  try {
    const { matchCode, matchPassword } = req.body || {};
    if (!matchCode) {
      return res.status(400).json({ success: false, message: 'Thiếu mã trận đấu.' });
    }

    const code = matchCode.trim().toUpperCase();
    let matchObj = memoryMatches.get(code);

    if (!matchObj && process.env.MONGO_URI && MatchModel.db?.readyState === 1) {
      matchObj = await (MatchModel as any).findOne({ matchCode: code });
    }

    if (!matchObj) {
      return res.status(404).json({ success: false, message: `Không tìm thấy trận đấu ${code}.` });
    }

    const actualPassword = matchObj.matchPassword || '123';
    if (matchPassword !== actualPassword) {
      return res.status(401).json({ success: false, message: 'Mật khẩu đăng nhập trận đấu không chính xác!' });
    }

    return res.json({ success: true, message: 'Mật khẩu trận đấu hợp lệ.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// Verify Role Access (Prevent URL tampering like ?role=admin)
app.post('/api/auth/verify-role-access', (req, res) => {
  try {
    const { role, roleToken, sessionToken, matchCode, matchPassword } = req.body || {};

    // Public / Viewer / Player roles can access if they have match password OR role token
    if (role === 'PLAYER' || role === 'VIEWER' || role === 'OVERLAY') {
      if (roleToken) {
        const tokenCheck = verifyRoleToken(roleToken, role);
        if (tokenCheck.valid) {
          return res.json({ success: true });
        }
      }
      if (sessionToken) {
        const session = getSession(sessionToken);
        if (session) return res.json({ success: true });
      }
      if (matchCode && matchPassword) {
        const code = matchCode.trim().toUpperCase();
        const matchObj = memoryMatches.get(code);
        if (matchObj && (matchObj.matchPassword || '123') === matchPassword) {
          return res.json({ success: true });
        }
      }
      // If neither is provided, allow if they are on SELECT screen or player/viewer with match password input prompt
      return res.json({ success: true, requiresPassword: true });
    }

    // Sensitive roles (ADMIN, KHO_DE, MC) strictly require valid Session or Role Token
    if (role === 'ADMIN' || role === 'KHO_DE' || role === 'MC') {
      if (roleToken) {
        const tokenCheck = verifyRoleToken(roleToken, role);
        if (tokenCheck.valid) {
          return res.json({ success: true });
        }
      }

      if (sessionToken) {
        const session = getSession(sessionToken);
        if (session) {
          return res.json({ success: true });
        }
      }

      if (matchCode && matchPassword) {
        const code = matchCode.trim().toUpperCase();
        const matchObj = memoryMatches.get(code);
        if (matchObj && (matchObj.matchPassword || '123') === matchPassword) {
          return res.json({ success: true });
        }
      }

      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền truy cập vai trò ${role}. Vui lòng đăng nhập tài khoản hoặc cung cấp mã/mật khẩu trận đấu hợp lệ.`
      });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// Retrieve list of all matches (filtered to user account when logged in, or all available matches in guest mode)
app.get('/api/matches', async (req, res) => {
  try {
    const currentUser = getRequestUser(req);
    const list: any[] = [];
    const processedCodes = new Set<string>();

    // 1. Load matches strictly belonging to currentUser's account if authenticated
    if (currentUser) {
      const userMatches = getUserMatches(currentUser.userId);
      for (const match of userMatches) {
        if (match && match.matchCode) {
          const code = match.matchCode.toUpperCase();
          memoryMatches.set(code, match);
          processedCodes.add(code);
          list.push({
            matchCode: code,
            matchName: match?.matchName || `Bộ đề ${code}`,
            matchPassword: match?.matchPassword || '123',
            tu_khoa_chinh: match?.vuot_chuong_ngai_vat?.tu_khoa_chinh || '',
            khoiDongCount: match?.khoi_dong?.cau_hoi?.length || 0,
            vcnvCount: match?.vuot_chuong_ngai_vat?.hang_ngang?.length || 0,
            tangTocCount: match?.tang_toc?.cau_hoi?.length || 0,
            veDichCount: match?.ve_dich?.cau_hoi?.length || 0,
            cauHoiPhuCount: match?.cau_hoi_phu?.cau_hoi?.length || 0,
            userId: match.userId || currentUser.userId,
            ownerEmail: match.ownerEmail || currentUser.email,
            ownerName: match.ownerName || currentUser.fullName,
            isOwner: true,
            updatedAt: match.updatedAt || match.createdAt || new Date().toISOString()
          });
        }
      }
    }

    // 2. Also check memoryMatches for all matches (in guest mode or matches created/loaded in memory)
    for (const [code, match] of memoryMatches.entries()) {
      if (!processedCodes.has(code)) {
        const isOwner = currentUser ? (
          (match?.ownerEmail && match.ownerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
          (match?.userId && match.userId === currentUser.userId) ||
          (!match?.userId && !match?.ownerEmail)
        ) : true;

        processedCodes.add(code);
        list.push({
          matchCode: code,
          matchName: match?.matchName || `Bộ đề ${code}`,
          matchPassword: match?.matchPassword || '123',
          tu_khoa_chinh: match?.vuot_chuong_ngai_vat?.tu_khoa_chinh || '',
          khoiDongCount: match?.khoi_dong?.cau_hoi?.length || 0,
          vcnvCount: match?.vuot_chuong_ngai_vat?.hang_ngang?.length || 0,
          tangTocCount: match?.tang_toc?.cau_hoi?.length || 0,
          veDichCount: match?.ve_dich?.cau_hoi?.length || 0,
          cauHoiPhuCount: match?.cau_hoi_phu?.cau_hoi?.length || 0,
          userId: match?.userId || currentUser?.userId,
          ownerEmail: match?.ownerEmail || currentUser?.email,
          ownerName: match?.ownerName || currentUser?.fullName,
          isOwner: Boolean(isOwner),
          updatedAt: match?.updatedAt || match?.createdAt || new Date().toISOString()
        });
      }
    }

    // 3. Check MongoDB for any matches
    if (process.env.MONGO_URI && MatchModel.db?.readyState === 1) {
      try {
        const query = currentUser ? {
          $or: [
            { userId: currentUser.userId },
            { ownerEmail: currentUser.email.toLowerCase() }
          ]
        } : {};
        const dbMatches = await (MatchModel as any).find(query);
        for (const dm of dbMatches) {
          const code = dm.matchCode.toUpperCase();
          if (!processedCodes.has(code)) {
            processedCodes.add(code);
            const obj = dm.toObject ? dm.toObject() : dm;
            memoryMatches.set(code, obj);
            list.push({
              matchCode: code,
              matchName: obj?.matchName || `Bộ đề ${code}`,
              matchPassword: obj.matchPassword || '123',
              tu_khoa_chinh: obj.vuot_chuong_ngai_vat?.tu_khoa_chinh || '',
              khoiDongCount: obj.khoi_dong?.cau_hoi?.length || 0,
              vcnvCount: obj.vuot_chuong_ngai_vat?.hang_ngang?.length || 0,
              tangTocCount: obj.tang_toc?.cau_hoi?.length || 0,
              veDichCount: obj.ve_dich?.cau_hoi?.length || 0,
              cauHoiPhuCount: obj.cau_hoi_phu?.cau_hoi?.length || 0,
              userId: obj.userId || currentUser?.userId,
              ownerEmail: obj.ownerEmail || currentUser?.email,
              ownerName: obj.ownerName || currentUser?.fullName,
              isOwner: true,
              updatedAt: obj.updatedAt || obj.createdAt || new Date().toISOString()
            });
          }
        }
      } catch (err) {
        console.error('Error fetching user matches from DB:', err);
      }
    }

    return res.json({ success: true, matches: list, user: currentUser });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Generate a random 6-digit code unique across the system
app.post('/api/match/generate-code', async (req, res) => {
  try {
    const currentUser = getRequestUser(req);
    const userMatches = currentUser ? getUserMatches(currentUser.userId) : [];
    const existingUserCodes = new Set(userMatches.map(m => m.matchCode.toUpperCase()));

    let uniqueCode = '';
    let attempts = 0;
    while (attempts < 500) {
      const num = Math.floor(100000 + Math.random() * 900000);
      const codeStr = num.toString();
      
      if (!existingUserCodes.has(codeStr) && !memoryMatches.has(codeStr)) {
        uniqueCode = codeStr;
        break;
      }
      attempts++;
    }
    
    if (!uniqueCode) {
      uniqueCode = Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    return res.json({ success: true, code: uniqueCode });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Create a new match set with auto-generated random 6-digit code
app.post('/api/match/create', async (req, res) => {
  try {
    const currentUser = getRequestUser(req);
    const userMatches = currentUser ? getUserMatches(currentUser.userId) : [];
    const existingUserCodes = new Set(userMatches.map(m => m.matchCode.toUpperCase()));

    // Always generate a unique random 6-digit code (or use client provided 6-digit code if valid & unique)
    let uniqueCode = '';
    const requestedCode = req.body?.matchCode?.toString()?.trim()?.toUpperCase();
    if (requestedCode && /^\d{6}$/.test(requestedCode) && !existingUserCodes.has(requestedCode)) {
      uniqueCode = requestedCode;
    } else {
      let attempts = 0;
      while (attempts < 500) {
        const num = Math.floor(100000 + Math.random() * 900000);
        const codeStr = num.toString();
        if (!existingUserCodes.has(codeStr) && !memoryMatches.has(codeStr)) {
          uniqueCode = codeStr;
          break;
        }
        attempts++;
      }
      if (!uniqueCode) {
        uniqueCode = Math.floor(100000 + Math.random() * 900000).toString();
      }
    }

    const customName = req.body?.matchName?.trim();
    const customPassword = req.body?.matchPassword?.trim();

    const finalName = customName || `Bộ đề ${uniqueCode}`;
    const blankMatch: any = createBlankMatch(uniqueCode, finalName);
    if (customPassword !== undefined && customPassword !== '') {
      blankMatch.matchPassword = customPassword;
    } else {
      blankMatch.matchPassword = '123';
    }
    if (currentUser) {
      blankMatch.userId = currentUser.userId;
      blankMatch.ownerEmail = currentUser.email;
      blankMatch.ownerName = currentUser.fullName;
    }
    blankMatch.updatedAt = new Date().toISOString();
    
    // Save to memoryMatches
    memoryMatches.set(uniqueCode, blankMatch);

    // Save to user account if logged in
    if (currentUser) {
      saveUserMatch(currentUser.userId, blankMatch);
    }

    // Save to json file
    try {
      const obj: Record<string, any> = {};
      for (const [k, v] of memoryMatches.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2), 'utf8');
    } catch (e) {
      console.error('Error writing blank match to matches_db.json:', e);
    }

    // Persist to MongoDB
    if (process.env.MONGO_URI && MatchModel.db?.readyState === 1) {
      await (MatchModel as any).create(blankMatch);
    }

    return res.json({
      success: true,
      matchCode: uniqueCode,
      matchName: finalName,
      match: blankMatch,
      savedToAccount: !!currentUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Delete match endpoint
app.delete('/api/match/:code', async (req, res) => {
  try {
    const code = req.params.code.trim().toUpperCase();
    
    if (code === 'OLYMPIA26') {
      return res.status(400).json({ success: false, message: 'Không thể xóa bộ đề mặc định OLYMPIA26 của hệ thống.' });
    }

    const currentUser = getRequestUser(req);
    if (currentUser) {
      deleteUserMatch(currentUser.userId, code);
      deleteUserMatch(currentUser.email, code);
    }

    // Also delete from any user cache who owns this code
    const existing = memoryMatches.get(code);
    if (existing?.userId) {
      deleteUserMatch(existing.userId, code);
    }
    if (existing?.ownerEmail) {
      deleteUserMatch(existing.ownerEmail, code);
    }

    // Sweep all users
    deleteUserMatch('', code);

    memoryMatches.delete(code);

    // Write updated cache to file
    try {
      const obj: Record<string, any> = {};
      for (const [k, v] of memoryMatches.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2), 'utf8');
    } catch (e) {
      console.error('Error writing file after deletion:', e);
    }

    // Delete from MongoDB
    if (process.env.MONGO_URI && MatchModel.db?.readyState === 1) {
      await (MatchModel as any).deleteOne({ matchCode: code });
    }

    console.log(`🗑️ Match [${code}] deleted successfully.`);
    return res.json({ success: true, message: `Xóa bộ đề [${code}] thành công!` });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Endpoint when no code is passed
app.get('/api/match', (req, res) => {
  return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã bộ đề hợp lệ.' });
});

// A convenient endpoint to check/load match questions
app.get('/api/match/:code', async (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const currentUser = getRequestUser(req);
  
  // 0. Check active GameManager instance first
  const manager = GameManager.getInstance();
  const activeQuestions = manager.getMatchQuestions();
  if (activeQuestions && manager.getMatchState().matchCode === code) {
    return res.json({ success: true, match: activeQuestions });
  }

  // 1. Check user-saved matches if user session exists
  if (currentUser) {
    const userMatch = getUserMatchByCode(currentUser.userId, code);
    if (userMatch) {
      memoryMatches.set(code, userMatch);
      return res.json({ success: true, match: userMatch });
    }
  }

  // 2. Check in-memory cache next
  if (memoryMatches.has(code)) {
    return res.json({ success: true, match: memoryMatches.get(code) });
  }

  // 3. Check Database
  try {
    if (process.env.MONGO_URI && MatchModel.db?.readyState === 1) {
      const match = await (MatchModel as any).findOne({ matchCode: code });
      if (match) {
        // Hydrate memory cache
        const obj = match.toObject ? match.toObject() : match;
        memoryMatches.set(code, obj);
        return res.json({ success: true, match: obj });
      }
    }
    
    return res.status(404).json({ success: false, message: `Không tìm thấy bộ đề ${code}` });
  } catch (error) {
    // Graceful fallback for DB errors / no connection
    console.warn(`⚠️ DB query failed for match code ${code}.`);
    return res.status(404).json({ success: false, message: 'Bộ đề không tồn tại trong chế độ offline.' });
  }
});

// Save match endpoint for web question input manager
app.post('/api/match/save', async (req, res) => {
  try {
    const matchData = req.body;
    if (!matchData || !matchData.matchCode) {
      return res.status(400).json({ success: false, message: 'Dữ liệu bộ đề không hợp lệ.' });
    }

    const currentUser = getRequestUser(req);
    const code = matchData.matchCode.trim().toUpperCase();

    if (currentUser) {
      matchData.userId = currentUser.userId;
      matchData.ownerEmail = currentUser.email;
      matchData.ownerName = currentUser.fullName;
    }
    matchData.updatedAt = new Date().toISOString();
    
    // Save to in-memory map
    memoryMatches.set(code, matchData);
    console.log(`💾 Match ${code} saved to in-memory cache.`);

    // Persist to user record in users_db.json
    let savedToUserAccount = false;
    if (currentUser) {
      savedToUserAccount = saveUserMatch(currentUser.userId, matchData);
    } else if (matchData.ownerEmail || matchData.userId) {
      savedToUserAccount = saveUserMatch(matchData.ownerEmail || matchData.userId, matchData);
    }

    // Persist to local JSON file
    try {
      const obj: Record<string, any> = {};
      for (const [k, v] of memoryMatches.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2), 'utf8');
      console.log(`💾 Saved matches to local matches_db.json successfully.`);
    } catch (e) {
      console.error('Error writing matches_db.json:', e);
    }

    // Persist to MongoDB if environment is set up and connected
    if (process.env.MONGO_URI && MatchModel.db?.readyState === 1) {
      await (MatchModel as any).findOneAndUpdate(
        { matchCode: code },
        matchData,
        { upsert: true, new: true }
      );
      console.log(`💾 Match ${code} persisted to MongoDB.`);
    }

    return res.json({
      success: true,
      message: savedToUserAccount
        ? `Đã lưu bộ đề ${code} an toàn vào tài khoản ${currentUser?.email || matchData.ownerEmail}!`
        : `Đã lưu bộ đề ${code} thành công!`,
      matchCode: code,
      savedToUserAccount
    });
  } catch (error) {
    console.error('Error saving match questions:', error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Bulk sync matches from client to user account
app.post('/api/match/sync', async (req, res) => {
  try {
    const currentUser = getRequestUser(req);
    const { matches } = req.body || {};
    if (!Array.isArray(matches)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu matches phải là một danh sách.' });
    }

    let count = 0;
    for (const m of matches) {
      if (m && m.matchCode) {
        const code = m.matchCode.trim().toUpperCase();
        if (code === 'OLYMPIA26') continue;
        if (currentUser) {
          m.userId = currentUser.userId;
          m.ownerEmail = currentUser.email;
          m.ownerName = currentUser.fullName;
          saveUserMatch(currentUser.userId, m);
        }
        memoryMatches.set(code, m);
        count++;
      }
    }

    try {
      const obj: Record<string, any> = {};
      for (const [k, v] of memoryMatches.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2), 'utf8');
    } catch (e) {}

    return res.json({
      success: true,
      message: currentUser
        ? `Đã đồng bộ ${count} bộ đề vào tài khoản ${currentUser.email} thành công!`
        : `Đã đồng bộ ${count} bộ đề vào bộ nhớ máy chủ!`,
      syncedCount: count
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Create a dummy match for easy instant testing
app.post('/api/match/seed', async (req, res) => {
  try {
    memoryMatches.set('OLYMPIA26', DEFAULT_MOCK_MATCH);
    
    if (process.env.MONGO_URI && MatchModel.db?.readyState === 1) {
      await (MatchModel as any).findOneAndUpdate(
        { matchCode: 'OLYMPIA26' },
        DEFAULT_MOCK_MATCH,
        { upsert: true, new: true }
      );
      console.log('✅ Mock Match seeded into MongoDB.');
    }
    return res.json({ success: true, message: 'Mock Match seeded successfully in-memory and database!', match: DEFAULT_MOCK_MATCH });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// API 404 Fallback - Always return JSON for unmatched /api routes, never HTML
app.all('/api/*', (req, res) => {
  return res.status(404).json({ success: false, message: `API endpoint ${req.method} ${req.originalUrl} không tồn tại.` });
});

// Setup Server & Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Bind socket handlers
setupSocketHandlers(io);

// Vite / static files handler
async function startApp() {
  // Try connecting DB first
  await connectDB();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Olympia Server running at http://localhost:${PORT}`);
  });
}

startApp().catch((err) => {
  console.error('❌ Failed to start application:', err);
});
