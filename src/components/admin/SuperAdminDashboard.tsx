import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  BarChart3,
  Bell,
  Settings,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  UserCheck,
  UserX,
  Trash2,
  Edit3,
  Crown,
  RefreshCw,
  Plus,
  Power,
  Server,
  Cpu,
  Activity,
  ArrowLeft,
  LogOut,
  X,
  Send,
  Eye,
  EyeOff,
  Check,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../auth/AuthModal';

interface SuperAdminDashboardProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onOpenController: () => void;
}

export default function SuperAdminDashboard({
  currentUser,
  onLogout,
  onOpenController
}: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'METRICS' | 'USERS' | 'ANNOUNCEMENTS' | 'SETTINGS'>('METRICS');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Stats State
  const [statsData, setStatsData] = useState<any>(null);

  // 2. Users State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'BANNED'>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // 3. Announcements State
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnType, setNewAnnType] = useState<'FEATURE' | 'UPDATE' | 'MAINTENANCE' | 'GENERAL'>('FEATURE');

  // 4. System Settings State
  const [settings, setSettings] = useState<{
    approvalMode: 'AUTO' | 'MANUAL';
    maintenanceMode: boolean;
    maintenanceMessage: string;
    allowRegistration: boolean;
  }>({
    approvalMode: 'AUTO',
    maintenanceMode: false,
    maintenanceMessage: '',
    allowRegistration: true
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('olympia_token') || '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch telemetry stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setStatsData(data.stats);
      }
    } catch (e) {
      console.error('Error fetching admin stats:', e);
    }
  };

  // Fetch user list
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setUsersList(data.users || []);
      }
    } catch (e) {
      console.error('Error fetching users:', e);
    }
  };

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements || []);
      }
    } catch (e) {
      console.error('Error fetching announcements:', e);
    }
  };

  // Fetch system settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchAnnouncements();
    fetchSettings();
  }, []);

  // Update user status
  const handleUpdateStatus = async (userId: string, newStatus: 'ACTIVE' | 'PENDING' | 'BANNED') => {
    try {
      const res = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        fetchUsers();
        fetchStats();
      } else {
        showToast(data.message || 'Lỗi cập nhật trạng thái', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ', 'error');
    }
  };

  // Update user role
  const handleUpdateRole = async (userId: string, newRole: 'ADMIN' | 'USER') => {
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        fetchUsers();
        fetchStats();
      } else {
        showToast(data.message || 'Lỗi cập nhật quyền', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ', 'error');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản [${email}] khỏi hệ thống?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        fetchUsers();
        fetchStats();
      } else {
        showToast(data.message || 'Lỗi xóa tài khoản', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ', 'error');
    }
  };

  // Save edited user profile
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId: editingUser.id,
          fullName: editingUser.fullName,
          status: editingUser.status,
          role: editingUser.role
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setEditingUser(null);
        fetchUsers();
        fetchStats();
      } else {
        showToast(data.message || 'Lỗi cập nhật', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ', 'error');
    }
  };

  // Create announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) {
      showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung', 'error');
      return;
    }
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: newAnnTitle,
          content: newAnnContent,
          type: newAnnType
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setNewAnnTitle('');
        setNewAnnContent('');
        fetchAnnouncements();
      } else {
        showToast(data.message || 'Lỗi tạo thông báo', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ', 'error');
    }
  };

  // Toggle announcement visibility
  const handleToggleAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/announcements/${id}/toggle`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        fetchAnnouncements();
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ', 'error');
    }
  };

  // Delete announcement
  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        fetchAnnouncements();
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ', 'error');
    }
  };

  // Save system settings
  const handleSaveSettings = async (newSettingsObj: any) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newSettingsObj)
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        showToast(data.message, 'success');
      } else {
        showToast(data.message || 'Lỗi lưu cấu hình', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ', 'error');
    }
  };

  // Filtered users list
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/90 border-rose-500/50 text-rose-300'
            }`}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP BAR */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white">
                  WEB ADMIN HỆ THỐNG
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Quản trị người dùng, thông số hạ tầng & chính sách hệ thống
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenController}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              <span>Giao Diện Controller</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng Xuất</span>
            </button>
          </div>

        </div>
      </header>

      {/* DASHBOARD NAVIGATION TABS */}
      <div className="border-b border-slate-850 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 pt-3">
          {[
            { id: 'METRICS', label: '📊 Thống Kê & Giám Sát', icon: BarChart3 },
            { id: 'USERS', label: '👥 Quản Lý Tài Khoản', icon: Users },
            { id: 'ANNOUNCEMENTS', label: '📢 Bản Tin & Cập Nhật', icon: Bell },
            { id: 'SETTINGS', label: '⚙️ Bảo Trì & Cài Đặt', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 border-slate-800 text-teal-400 border-b-2 border-b-slate-900 -mb-px'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* TAB 1: METRICS & TELEMETRY */}
        {activeTab === 'METRICS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Thông Số Hoạt Động & Giám Sát</h2>
                <p className="text-xs text-slate-400">Dữ liệu thời gian thực từ máy chủ và các phòng thi đấu</p>
              </div>
              <button
                onClick={() => {
                  fetchStats();
                  fetchUsers();
                  showToast('Đã làm mới số liệu', 'success');
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                <span>Làm Mới Số Liệu</span>
              </button>
            </div>

            {/* Top Cards: User Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>Tổng Tài Khoản</span>
                  <Users className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-2xl font-black text-white mt-2 font-mono">
                  {statsData?.users?.total ?? usersList.length}
                </div>
                <div className="text-[10px] text-teal-400 mt-1 font-semibold">Tất cả tài khoản hệ thống</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>Đang Hoạt Động</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
                  {statsData?.users?.active ?? usersList.filter(u => u.status === 'ACTIVE').length}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Đã được phê duyệt</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>Chờ Phê Duyệt</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400 mt-2 font-mono">
                  {statsData?.users?.pending ?? usersList.filter(u => u.status === 'PENDING').length}
                </div>
                <div className="text-[10px] text-amber-400/80 mt-1">Cần duyệt thủ công</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>Bị Khóa / Tạm Dừng</span>
                  <XCircle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-black text-rose-400 mt-2 font-mono">
                  {statsData?.users?.banned ?? usersList.filter(u => u.status === 'BANNED').length}
                </div>
                <div className="text-[10px] text-rose-400/80 mt-1">Vô hiệu hóa truy cập</div>
              </div>
            </div>

            {/* Middle Cards: Server & Infrastructure */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-indigo-400 uppercase tracking-wider">
                  <Server className="w-4 h-4" />
                  <span>Hạ Tầng Máy Chủ (Node.js)</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Uptime:</span>
                    <span className="font-mono font-bold text-white">
                      {Math.floor((statsData?.system?.uptimeSeconds || 0) / 60)} phút
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Node Runtime:</span>
                    <span className="font-mono font-bold text-white">{statsData?.system?.nodeVersion || 'v20.x'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Hệ điều hành:</span>
                    <span className="font-mono font-bold text-white">{statsData?.system?.platform || 'linux'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-teal-400 uppercase tracking-wider">
                  <Cpu className="w-4 h-4" />
                  <span>Bộ Nhớ & RAM</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Heap Used:</span>
                    <span className="font-mono font-bold text-emerald-400">{statsData?.system?.memory?.heapUsedMb || 0} MB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Heap Total:</span>
                    <span className="font-mono font-bold text-slate-200">{statsData?.system?.memory?.heapTotalMb || 0} MB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">RSS Resident:</span>
                    <span className="font-mono font-bold text-slate-200">{statsData?.system?.memory?.rssMb || 0} MB</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
                  <Activity className="w-4 h-4" />
                  <span>Phiên Đang Diễn Ra</span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mã trận hoạt động:</span>
                    <span className="font-mono font-bold text-amber-400">{statsData?.matches?.activeMatchCode || 'Chưa nạp'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Vòng thi hiện tại:</span>
                    <span className="font-mono font-bold text-white">{statsData?.matches?.currentRound || 'START'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Bộ đề trong RAM:</span>
                    <span className="font-mono font-bold text-white">{statsData?.matches?.totalLoadedInMem || 0} bộ</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT & APPROVALS */}
        {activeTab === 'USERS' && (
          <div className="space-y-6">
            
            {/* Header & Controls Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white">Quản Lý Danh Sách Tài Khoản</h2>
                <p className="text-xs text-slate-400">
                  Chế độ duyệt hiện tại: <strong>{settings.approvalMode === 'AUTO' ? 'Tự Động (Auto-Approve)' : 'Duyệt Thủ Công (Manual Approval)'}</strong>
                </p>
              </div>

              {/* Approval Mode Quick Toggle */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
                <span className="text-xs text-slate-400 font-bold px-2">Chế độ duyệt:</span>
                <button
                  onClick={() => handleSaveSettings({ ...settings, approvalMode: 'AUTO' })}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    settings.approvalMode === 'AUTO'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tự Động (Auto)
                </button>
                <button
                  onClick={() => handleSaveSettings({ ...settings, approvalMode: 'MANUAL' })}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    settings.approvalMode === 'MANUAL'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Thủ Công (Manual)
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
              
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo email, họ tên, mã ID..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
                  <option value="PENDING">Chờ duyệt (PENDING)</option>
                  <option value="BANNED">Đã bị khóa (BANNED)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tất cả vai trò</option>
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  <option value="USER">Người dùng (USER)</option>
                </select>
              </div>

            </div>

            {/* Users Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Người Dùng</th>
                      <th className="px-4 py-3">Vai Trò</th>
                      <th className="px-4 py-3">Trạng Thái</th>
                      <th className="px-4 py-3">Xác Thực Email</th>
                      <th className="px-4 py-3">Số Bộ Đề</th>
                      <th className="px-4 py-3">Ngày Tạo</th>
                      <th className="px-4 py-3 text-right">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                          Không tìm thấy tài khoản nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-850/50 transition-colors">
                          
                          {/* User info */}
                          <td className="px-4 py-3">
                            <div className="font-bold text-white">{u.fullName}</div>
                            <div className="text-[11px] text-indigo-300 font-mono">{u.email}</div>
                            <div className="text-[9px] text-slate-500 font-mono">ID: {u.id}</div>
                          </td>

                          {/* Role */}
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              u.role === 'ADMIN'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              {u.role === 'ADMIN' ? '👑 ADMIN' : 'USER'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : u.status === 'PENDING'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}>
                              {u.status === 'ACTIVE' ? 'Đang hoạt động' : u.status === 'PENDING' ? 'Chờ duyệt' : 'Bị khóa'}
                            </span>
                          </td>

                          {/* Email verified */}
                          <td className="px-4 py-3">
                            {u.isEmailVerified ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Đã xác thực
                              </span>
                            ) : (
                              <span className="text-slate-500 font-semibold">Chưa xác thực</span>
                            )}
                          </td>

                          {/* Match count */}
                          <td className="px-4 py-3 font-mono font-bold text-slate-300">
                            {u.savedMatchesCount || 0}
                          </td>

                          {/* Created date */}
                          <td className="px-4 py-3 text-slate-400 text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              
                              {/* Quick Approve button if pending */}
                              {u.status === 'PENDING' && (
                                <button
                                  onClick={() => handleUpdateStatus(u.id, 'ACTIVE')}
                                  title="Phê duyệt tài khoản"
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow"
                                >
                                  Duyệt
                                </button>
                              )}

                              {/* Ban / Unban Toggle */}
                              {u.status === 'BANNED' ? (
                                <button
                                  onClick={() => handleUpdateStatus(u.id, 'ACTIVE')}
                                  title="Mở khóa tài khoản"
                                  className="p-1.5 bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all cursor-pointer border border-slate-700"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateStatus(u.id, 'BANNED')}
                                  title="Khóa tài khoản"
                                  className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-all cursor-pointer border border-slate-700"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Admin Role Toggle */}
                              {u.role === 'ADMIN' ? (
                                <button
                                  onClick={() => handleUpdateRole(u.id, 'USER')}
                                  title="Hạ quyền xuống User"
                                  className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-all cursor-pointer border border-slate-700"
                                >
                                  <Crown className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateRole(u.id, 'ADMIN')}
                                  title="Thăng quyền lên Super Admin"
                                  className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 rounded-lg transition-all cursor-pointer border border-slate-700"
                                >
                                  <Crown className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Edit details */}
                              <button
                                onClick={() => setEditingUser({ ...u })}
                                title="Chỉnh sửa thông tin"
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded-lg transition-all cursor-pointer border border-slate-700"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                title="Xóa vĩnh viễn"
                                className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer border border-slate-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: ANNOUNCEMENTS MANAGEMENT */}
        {activeTab === 'ANNOUNCEMENTS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Create Announcement Form */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-teal-400" />
                  Đăng Bản Tin & Cập Nhật Mới
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Thông báo sẽ hiển thị trực tiếp trên bảng điều khiển hệ thống
                </p>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Loại Thông Báo</label>
                  <select
                    value={newAnnType}
                    onChange={(e) => setNewAnnType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="FEATURE">🚀 Tính Năng Mới (FEATURE)</option>
                    <option value="UPDATE">🔄 Cập Nhật Hệ Thống (UPDATE)</option>
                    <option value="MAINTENANCE">⚠️ Thông Báo Bảo Trì (MAINTENANCE)</option>
                    <option value="GENERAL">📢 Tin Tức Chung (GENERAL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Tiêu Đề Thông Báo</label>
                  <input
                    type="text"
                    required
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    placeholder="vd: Ra mắt format thi đấu Tăng Tốc cải tiến..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Nội Dung Chi Tiết</label>
                  <textarea
                    required
                    rows={5}
                    value={newAnnContent}
                    onChange={(e) => setNewAnnContent(e.target.value)}
                    placeholder="Mô tả các thay đổi hoặc thông điệp gửi đến người dùng..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Phát Hành Thông Báo</span>
                </button>
              </form>
            </div>

            {/* Announcements List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white">Danh Sách Thông Báo Đã Đăng</h3>
                <span className="text-xs text-slate-400 font-mono font-bold">{announcements.length} thông báo</span>
              </div>

              {announcements.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center text-slate-500 text-xs">
                  Chưa có thông báo nào được đăng tải.
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className={`bg-slate-900 border p-4 rounded-2xl space-y-2 transition-all ${
                        ann.active ? 'border-slate-800' : 'border-slate-800/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            ann.type === 'FEATURE' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' :
                            ann.type === 'MAINTENANCE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                            'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {ann.type}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(ann.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleAnnouncement(ann.id)}
                            title={ann.active ? 'Ẩn thông báo' : 'Hiện thông báo'}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all cursor-pointer"
                          >
                            {ann.active ? <Eye className="w-3.5 h-3.5 text-teal-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            title="Xóa thông báo"
                            className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 rounded-lg text-xs transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{ann.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: MAINTENANCE MODE & SYSTEM SETTINGS */}
        {activeTab === 'SETTINGS' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
              
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  Chế Độ Bảo Trì Hệ Thống (Maintenance Mode)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Khi bật chế độ bảo trì, người dùng thông thường sẽ thấy màn hình thông báo và không thể tham gia thi đấu. Chỉ tài khoản Quản Trị Viên mới có quyền đăng nhập.
                </p>
              </div>

              {/* Maintenance Toggle */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Trạng thái bảo trì:</span>
                  <span className={`text-[11px] font-bold ${settings.maintenanceMode ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {settings.maintenanceMode ? 'ĐANG BẬT BẢO TRÌ (CHẶN USER THƯỜNG)' : 'ĐANG TẮT (HOẠT ĐỘNG BÌNH THƯỜNG)'}
                  </span>
                </div>

                <button
                  onClick={() => handleSaveSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow ${
                    settings.maintenanceMode
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{settings.maintenanceMode ? 'Tắt Bảo Trì' : 'Bật Bảo Trì'}</span>
                </button>
              </div>

              {/* Maintenance Message */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Thông Điệp Hiển Thị Khi Bảo Trì
                </label>
                <textarea
                  rows={3}
                  value={settings.maintenanceMessage}
                  onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                  placeholder="Nhập thông điệp hiển thị trên trang chủ..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              {/* Registration Toggle */}
              <div className="border-t border-slate-800 pt-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Cổng Đăng Ký Tài Khoản Mới:</span>
                  <span className="text-[11px] text-slate-400">
                    {settings.allowRegistration ? 'Cho phép người dùng mới tạo tài khoản' : 'Đang tạm khóa cổng đăng ký'}
                  </span>
                </div>

                <button
                  onClick={() => handleSaveSettings({ ...settings, allowRegistration: !settings.allowRegistration })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    settings.allowRegistration
                      ? 'bg-slate-800 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {settings.allowRegistration ? 'Đang Mở' : 'Đang Đóng'}
                </button>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleSaveSettings(settings)}
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
                >
                  Lưu Tất Cả Cài Đặt Hệ Thống
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-teal-400" />
                Chỉnh Sửa Tài Khoản
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Email (Định Danh):</label>
                <input
                  type="text"
                  disabled
                  value={editingUser.email}
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Họ & Tên:</label>
                <input
                  type="text"
                  required
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Trạng Thái:</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE (Hoạt động)</option>
                    <option value="PENDING">PENDING (Chờ duyệt)</option>
                    <option value="BANNED">BANNED (Khóa)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Vai Trò:</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="USER">USER (Người dùng)</option>
                    <option value="ADMIN">ADMIN (Quản trị viên)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 text-xs font-black rounded-xl transition-all shadow cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
