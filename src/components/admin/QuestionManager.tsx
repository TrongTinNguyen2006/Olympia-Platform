import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import UniversalMediaPlayer from '../UniversalMediaPlayer.js';
import { 
  MatchDbModel, 
  KhoiDongQuestion, 
  ObstacleRow, 
  TangTocQuestion, 
  TangTocCaiTienQuestion,
  TangTocCaiTienHint,
  VeDichQuestion, 
  CauHoiPhuQuestion,
  ExternalMediaItem,
  MaTranKepQuestion,
  ChinhPhucQuestion,
  GMDTQuestion,
  DauTriQuestion,
  DauTriBonusPack,
  DauTriBonusQuestion,
  SocketEvent
} from '../../types.js';
import { textToGmdtMatMa } from '../../utils/gmdt.js';
import { safeFetchJson } from '../../utils/api.js';
import { UserProfile } from '../auth/AuthModal.js';
import { 
  Save, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Database, 
  Check, 
  AlertCircle, 
  FileText, 
  Settings, 
  Award, 
  RefreshCw, 
  Upload, 
  Download, 
  Search, 
  Sparkles,
  ExternalLink,
  Link,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Film,
  Play,
  Volume2,
  Music,
  Video,
  Image,
  PlayCircle,
  User,
  UserCheck,
  Cloud,
  CloudUpload,
  LogIn,
  Filter,
  ShieldCheck,
  FileSpreadsheet,
  Brain,
  X
} from 'lucide-react';

interface QuestionManagerProps {
  onClose?: () => void;
  adminCommand?: (event: SocketEvent, data?: any) => void;
  activeMatchCode?: string;
  currentUser?: UserProfile | null;
  sessionToken?: string | null;
  onOpenAuthModal?: () => void;
}

interface MatchListItem {
  matchCode: string;
  matchName?: string;
  matchPassword?: string;
  tu_khoa_chinh: string;
  khoiDongCount: number;
  vcnvCount: number;
  tangTocCount: number;
  veDichCount: number;
  cauHoiPhuCount: number;
  userId?: string;
  ownerEmail?: string;
  ownerName?: string;
  isOwner?: boolean;
  isDefault?: boolean;
  updatedAt?: string;
}

const LING_VUC_OPTIONS = [
  "Toán", "Lý", "Hoá", "Sinh", "Văn", "Sử", "Địa", "Anh", "TT", "NT", "HBC", "PL", "Tin"
];

const normalizeLinhVuc = (val: string) => {
  if (!val) return "Toán";
  const v = val.trim();
  if (v.toLowerCase().startsWith("thể thao") || v === "TT") return "TT";
  if (v.toLowerCase().startsWith("nghệ thuật") || v === "NT") return "NT";
  if (v.toLowerCase().startsWith("hiểu biết chung") || v === "HBC") return "HBC";
  if (v.toLowerCase().startsWith("pháp luật") || v === "PL") return "PL";
  if (v.toLowerCase().startsWith("khoa học tổng hợp") || v === "KHTH") return "HBC";
  return v;
};

const createDefaultCategories = (size: '5x4' | '6x5') => {
  const is6x5 = size === '6x5';
  const numCats = is6x5 ? 6 : 5;
  const numClues = is6x5 ? 5 : 4;

  const sampleCategoriesData = [
    {
      title: 'LỊCH SỬ VIỆT NAM',
      clues: [
        { points: 10, question: 'Vị tướng đã chỉ huy Trận Bạch Đằng năm 938 đánh tan quân Nam Hán?', dap_an_dung: 'NGÔ QUYỀN' },
        { points: 20, question: 'Tên quốc hiệu đầu tiên trong lịch sử nước ta dưới thời Các Vua Hùng?', dap_an_dung: 'VĂN LANG' },
        { points: 30, question: 'Ai là tác giả của bản "Hịch tướng sĩ" nổi tiếng thời nhà Trần?', dap_an_dung: 'TRẦN HƯNG ĐẠO / TRẦN QUỐC TUẤN' },
        { points: 40, question: 'Thủ đô Thăng Long chính thức được Lý Thái Tổ dời về từ đâu vào năm 1010?', dap_an_dung: 'HOA LƯ' },
        { points: 50, question: 'Vị vua cuối cùng của triều đại phong kiến Việt Nam là ai?', dap_an_dung: 'BẢO ĐẠI' },
      ]
    },
    {
      title: 'ĐỊA LÝ & TỰ NHIÊN',
      clues: [
        { points: 10, question: 'Tỉnh thành nào có diện tích tự nhiên lớn nhất Việt Nam?', dap_an_dung: 'NGHỆ AN' },
        { points: 20, question: 'Ngọn núi cao nhất Việt Nam và toàn cõi Đông Dương là núi nào?', dap_an_dung: 'FANSIPAN / PANSIPAN' },
        { points: 30, question: 'Con sông chảy hoàn toàn trên lãnh thổ Việt Nam có chiều dài lớn nhất?', dap_an_dung: 'SÔNG ĐỒNG NAI' },
        { points: 40, question: 'Thành phố trực thuộc trung ương nào nằm ở khu vực Đồng bằng Sông Cửu Long?', dap_an_dung: 'CẦN THƠ' },
        { points: 50, question: 'Hồ nước ngọt tự nhiên lớn nhất Việt Nam nằm ở tỉnh Bắc Kạn?', dap_an_dung: 'HỒ BA BỂ' },
      ]
    },
    {
      title: 'KHOA HỌC & TỰ NHIÊN',
      clues: [
        { points: 10, question: 'Hành tinh nào nằm gần Mặt Trời nhất trong Hệ Mặt Trời?', dap_an_dung: 'SAO THỦY' },
        { points: 20, question: 'Khí nào chiếm tỉ lệ phần trăm thể tích lớn nhất trong không khí quyển Trái Đất?', dap_an_dung: 'NITƠ (N2)' },
        { points: 30, question: 'Bảng tuần hoàn các nguyên tố hóa học do nhà khoa học nào công bố năm 1869?', dap_an_dung: 'MENDELEEV' },
        { points: 40, question: 'Vận tốc ánh sáng trong chân không xấp xỉ bằng bao nhiêu km/s?', dap_an_dung: '300.000 KM/S' },
        { points: 50, question: 'Bào quan trong tế bào nhân thực được gọi là "nhà máy năng lượng" của tế bào?', dap_an_dung: 'TY THỂ' },
      ]
    },
    {
      title: 'VĂN HỌC & NGHỆ THUẬT',
      clues: [
        { points: 10, question: 'Tác giả của kiệt tác "Truyện Kiều" là danh nhân văn hóa nào?', dap_an_dung: 'NGUYỄN DU' },
        { points: 20, question: 'Nhà văn là tác giả của tác phẩm thiếu nhi "Dế Mèn Phiêu Lưu Ký"?', dap_an_dung: 'TÔ HOÀI' },
        { points: 30, question: 'Họa sĩ là tác giả của bức tranh sơn dầu nổi tiếng "Thiếu nữ bên hoa huệ"?', dap_an_dung: 'TÔ NGỌC VÂN' },
        { points: 40, question: 'Nhạc sĩ sáng tác ca khúc "Tiến Quân Ca" - Quốc ca Việt Nam?', dap_an_dung: 'VĂN CAO' },
        { points: 50, question: 'Tập thơ "Nhật ký trong tù" của Chủ tịch Hồ Chí Minh gồm bao nhiêu bài thơ chữ Hán?', dap_an_dung: '133 BÀI THƠ' },
      ]
    },
    {
      title: 'THỂ THAO & GIẢI TRÍ',
      clues: [
        { points: 10, question: 'Giải vô địch bóng đá thế giới FIFA World Cup được tổ chức định kỳ mấy năm 1 lần?', dap_an_dung: '4 NĂM' },
        { points: 20, question: 'Môn thể thao nào được vinh danh là "Môn thể thao Vua"?', dap_an_dung: 'BÓNG ĐÁ' },
        { points: 30, question: 'Vận động viên điền kinh người Jamaica giữ kỷ lục thế giới chạy 100m (9.58s)?', dap_an_dung: 'USAIN BOLT' },
        { points: 40, question: 'Đội tuyển bóng đá nam nào giàu thành tích nhất lịch sử World Cup với 5 lần vô địch?', dap_an_dung: 'BRAZIL' },
        { points: 50, question: 'Quốc gia nào là quê hương của Thế vận hội Olympic thời cổ đại?', dap_an_dung: 'HY LẠP' },
      ]
    },
    {
      title: 'HIỂU BIẾT CHUNG',
      clues: [
        { points: 10, question: 'Đơn vị tiền tệ chính thức của Liên minh Châu Âu (EU) là gì?', dap_an_dung: 'EURO' },
        { points: 20, question: 'Đất nước nào có diện tích lãnh thổ lớn nhất thế giới?', dap_an_dung: 'NGA' },
        { points: 30, question: 'Ngôn ngữ nào có số lượng người nói bản ngữ đông nhất thế giới?', dap_an_dung: 'TIẾNG TRUNG QUỐC' },
        { points: 40, question: 'Tòa nhà cao nhất thế giới hiện nay Burj Khalifa nằm ở thành phố nào?', dap_an_dung: 'DUBAI' },
        { points: 50, question: 'Đại dương nào có diện tích và độ sâu lớn nhất trên Trái Đất?', dap_an_dung: 'THÁI BÌNH DƯƠNG' },
      ]
    }
  ];

  return Array.from({ length: numCats }, (_, cIdx) => {
    const catData = sampleCategoriesData[cIdx] || { title: `CHỦ ĐỀ ${cIdx + 1}`, clues: [] };
    return {
      title: catData.title,
      clues: Array.from({ length: numClues }, (_, kIdx) => {
        const clueData = catData.clues[kIdx] || {
          points: (kIdx + 1) * 10,
          question: `Nội dung gợi ý ${(kIdx + 1) * 10} điểm - Chủ đề ${cIdx + 1}`,
          dap_an_dung: `ĐÁP ÁN ${(kIdx + 1) * 10}Đ`
        };
        return {
          points: clueData.points,
          question: clueData.question,
          dap_an_dung: clueData.dap_an_dung
        };
      })
    };
  });
};

export default function QuestionManager({
  onClose,
  adminCommand,
  activeMatchCode,
  currentUser,
  sessionToken,
  onOpenAuthModal
}: QuestionManagerProps) {
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [matchCode, setMatchCode] = useState(() => activeMatchCode || '');
  const [matchName, setMatchName] = useState('');
  const [matchPassword, setMatchPassword] = useState('123');
  const [activeTab, setActiveTab] = useState<'KHOI_DONG' | 'VCNV' | 'TANG_TOC' | 'VE_DICH' | 'CH_PHU' | 'MEDIA' | 'JEOPARDY' | 'MA_TRAN_KEP' | 'CHINH_PHUC' | 'DAU_TRI'>('KHOI_DONG');

  // Helper to create 25 default Dau Tri questions
  const createDefaultDauTriQs = (): DauTriQuestion[] => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      noi_dung: '',
      dap_an_dung: '',
      chu_thich: '',
      goi_thuong: {
        chu_de: `Chủ đề thưởng ${i + 1}`,
        cau_hoi: [
          { id: `${i + 1}_1`, noi_dung: '', dap_an_dung: '', chu_thich: '' },
          { id: `${i + 1}_2`, noi_dung: '', dap_an_dung: '', chu_thich: '' },
          { id: `${i + 1}_3`, noi_dung: '', dap_an_dung: '', chu_thich: '' }
        ]
      }
    }));
  };

  // Edit/Add External Media Modal state
  const [editMediaModal, setEditMediaModal] = useState<{
    isOpen: boolean;
    item: ExternalMediaItem | null;
  }>({ isOpen: false, item: null });
  const [draftMediaName, setDraftMediaName] = useState('');
  const [draftMediaUrlItem, setDraftMediaUrlItem] = useState('');
  const [draftMediaTypeItem, setDraftMediaTypeItem] = useState<'audio' | 'image' | 'video'>('video');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({ type: null, message: '' });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Dialog/Popup state for custom Create Match (6-digit ID)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMatchCode, setNewMatchCode] = useState('');
  const [newMatchName, setNewMatchName] = useState('');
  const [newMatchPassword, setNewMatchPassword] = useState('123');
  const [newMatchError, setNewMatchError] = useState('');

  // Dialog/Popup state for Excel upload when no match is selected
  const [showExcelSaveModal, setShowExcelSaveModal] = useState(false);
  const [excelPendingWb, setExcelPendingWb] = useState<any>(null);
  const [excelPendingFileName, setExcelPendingFileName] = useState('');
  const [excelModalCode, setExcelModalCode] = useState('');
  const [excelModalName, setExcelModalName] = useState('');
  const [excelModalPassword, setExcelModalPassword] = useState('123');
  const [excelModalError, setExcelModalError] = useState('');

  // Dialog/Popup state for media attachment
  const [mediaModalState, setMediaModalState] = useState<{
    isOpen: boolean;
    round: 'KHOI_DONG' | 'VCNV' | 'TANG_TOC_Q' | 'TANG_TOC_A' | 'VE_DICH';
    index: number;
    url: string;
    type: 'image' | 'video' | 'audio';
  } | null>(null);

  // Edit/Add Question Modal state
  const [editQuestionModal, setEditQuestionModal] = useState<{
    isOpen: boolean;
    round: 'KHOI_DONG' | 'VE_DICH' | 'CHINH_PHUC_DE' | 'CHINH_PHUC_TB' | 'CHINH_PHUC_KHO';
    questionId: string; // Empty string if adding a new question
    suggestedPoints?: 20 | 30;
  } | null>(null);

  // Draft fields for the Edit/Add Question modal
  const [draftLinhVuc, setDraftLinhVuc] = useState('Toán');
  const [draftNoiDung, setDraftNoiDung] = useState('');
  const [draftDapAnDung, setDraftDapAnDung] = useState('');
  const [draftChuThich, setDraftChuThich] = useState('');
  const [draftMucDiem, setDraftMucDiem] = useState<10 | 20 | 30 | 40>(20);
  const [draftMediaUrl, setDraftMediaUrl] = useState('');
  const [draftMediaType, setDraftMediaType] = useState<'image' | 'video' | 'audio'>('image');

  // Form states matching MatchDbModel structure
  const [khoiDongQs, setKhoiDongQs] = useState<KhoiDongQuestion[]>([]);
  const [vcnvWord, setVcnvWord] = useState('');
  const [vcnvImage, setVcnvImage] = useState('');
  const [vcnvSoHN, setVcnvSoHN] = useState<4 | 8>(4);
  const [vcnvRows, setVcnvRows] = useState<ObstacleRow[]>([]);
  const [tangTocQs, setTangTocQs] = useState<TangTocQuestion[]>([]);
  const [tangTocCaiTienQs, setTangTocCaiTienQs] = useState<TangTocCaiTienQuestion[]>([]);
  const [tangTocSubTab, setTangTocSubTab] = useState<'TRADITIONAL' | 'IMPROVED'>('TRADITIONAL');
  const [veDichQs, setVeDichQs] = useState<VeDichQuestion[]>([]);
  const [cauHoiPhuQs, setCauHoiPhuQs] = useState<CauHoiPhuQuestion[]>([]);
  const [mediaNgoai, setMediaNgoai] = useState<ExternalMediaItem[]>([]);
  const [jeopardyBoardSize, setJeopardyBoardSize] = useState<'5x4' | '6x5'>('5x4');
  const [jeopardyCategories, setJeopardyCategories] = useState<any[]>([]);
  const [maTranKepQs, setMaTranKepQs] = useState<MaTranKepQuestion[]>([]);
  const [dapAnNhieu, setDapAnNhieu] = useState<string[]>([]);
  const [chinhPhucDeQs, setChinhPhucDeQs] = useState<ChinhPhucQuestion[]>([]);
  const [chinhPhucTrungBinhQs, setChinhPhucTrungBinhQs] = useState<ChinhPhucQuestion[]>([]);
  const [chinhPhucKhoQs, setChinhPhucKhoQs] = useState<ChinhPhucQuestion[]>([]);
  const [gmdtQs, setGmdtQs] = useState<GMDTQuestion[]>([]);
  const [chinhPhucSubTab, setChinhPhucSubTab] = useState<'cp' | 'gmdt'>('cp');
  const [chinhPhucTier, setChinhPhucTier] = useState<'de' | 'trung_binh' | 'kho'>('de');
  const [dauTriQs, setDauTriQs] = useState<DauTriQuestion[]>(createDefaultDauTriQs);
  const [dauTriActiveIndex, setDauTriActiveIndex] = useState<number>(0);
  const [dauTriSearchQuery, setDauTriSearchQuery] = useState<string>('');
  const [dauTriFilterMode, setDauTriFilterMode] = useState<'ALL' | number>('ALL');

  // User session state
  const [currentUserState, setCurrentUserState] = useState<UserProfile | null>(() => {
    if (currentUser) return currentUser;
    try {
      const saved = localStorage.getItem('olympia_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [sessionTokenState, setSessionTokenState] = useState<string | null>(() => {
    return sessionToken || localStorage.getItem('olympia_token') || null;
  });

  // Tab filter: 'ALL' | 'MY_MATCHES'
  const [matchListFilter, setMatchListFilter] = useState<'ALL' | 'MY_MATCHES'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (currentUser !== undefined) {
      setCurrentUserState(currentUser);
    }
    if (sessionToken !== undefined) {
      setSessionTokenState(sessionToken);
    }
  }, [currentUser, sessionToken]);

  // Helper to build headers with Authorization bearer token
  const getAuthHeaders = () => {
    const token = sessionTokenState || localStorage.getItem('olympia_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  // Helper to delete a match from all localStorage caches
  const deleteLocalBackup = (code: string) => {
    try {
      const codeUpper = (code || '').trim().toUpperCase();
      if (!codeUpper) return;

      const email = currentUserState?.email || 'guest';
      const userKey = `olympia_saved_matches_${email}`;
      const guestKey = 'olympia_saved_matches_guest';

      [userKey, guestKey].forEach(k => {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            let list: any[] = JSON.parse(raw);
            if (Array.isArray(list)) {
              list = list.filter(m => m && m.matchCode && m.matchCode.toUpperCase() !== codeUpper);
              localStorage.setItem(k, JSON.stringify(list));
            }
          } catch {}
        }
      });
      localStorage.removeItem(`olympia_match_${codeUpper}`);
      localStorage.removeItem(`olympia_match_${code}`);
    } catch (e) {
      console.warn('Failed to delete local backup:', e);
    }
  };

  // Helper to mirror saved matches to local storage for backup resilience
  const saveLocalBackup = (matchObj: MatchDbModel) => {
    try {
      const email = currentUserState?.email || 'guest';
      const userKey = `olympia_saved_matches_${email}`;
      const guestKey = 'olympia_saved_matches_guest';
      
      [userKey, guestKey].forEach(k => {
        const raw = localStorage.getItem(k);
        let list: any[] = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) list = [];
        const idx = list.findIndex(m => m.matchCode === matchObj.matchCode);
        if (idx >= 0) {
          list[idx] = matchObj;
        } else {
          list.push(matchObj);
        }
        localStorage.setItem(k, JSON.stringify(list));
      });
      localStorage.setItem(`olympia_match_${matchObj.matchCode}`, JSON.stringify(matchObj));
    } catch (e) {
      console.warn('Failed to write local backup:', e);
    }
  };

  // Helper to read all matches from local storage
  const getLocalBackupMatches = (): MatchListItem[] => {
    const results: MatchListItem[] = [];
    const seen = new Set<string>();
    try {
      const keys = ['olympia_saved_matches_guest', `olympia_saved_matches_${currentUserState?.email || 'guest'}`];
      for (const k of keys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            for (const m of arr) {
              if (m && m.matchCode && !seen.has(m.matchCode.toUpperCase())) {
                const code = m.matchCode.toUpperCase();
                seen.add(code);
                results.push({
                  matchCode: code,
                  matchName: m.matchName || `Bộ đề ${code}`,
                  matchPassword: m.matchPassword || '123',
                  tu_khoa_chinh: m.vuot_chuong_ngai_vat?.tu_khoa_chinh || '',
                  khoiDongCount: m.khoi_dong?.cau_hoi?.length || 0,
                  vcnvCount: m.vuot_chuong_ngai_vat?.hang_ngang?.length || 0,
                  tangTocCount: m.tang_toc?.cau_hoi?.length || 0,
                  veDichCount: m.ve_dich?.cau_hoi?.length || 0,
                  cauHoiPhuCount: m.cau_hoi_phu?.cau_hoi?.length || 0,
                  isOwner: true,
                  updatedAt: m.updatedAt || new Date().toISOString()
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error reading local backup matches:', e);
    }
    return results;
  };

  // Auto-save tracking refs and states
  const isLoadedRef = useRef(false);
  const autoSaveTimerRef = useRef<any>(null);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>('');

  // Fetch list of matches
  const fetchMatchesList = async () => {
    // 1. Immediately hydrate with any local backups
    const localItems = getLocalBackupMatches();
    if (localItems.length > 0) {
      setMatches(prev => {
        const map = new Map<string, MatchListItem>();
        localItems.forEach(item => map.set(item.matchCode.toUpperCase(), item));
        prev.forEach(item => map.set(item.matchCode.toUpperCase(), item));
        return Array.from(map.values());
      });
    }

    // 2. Fetch from backend API
    try {
      const data = await safeFetchJson<any>('/api/matches', {
        headers: getAuthHeaders()
      });
      if (data && data.success && Array.isArray(data.matches)) {
        const serverMatches: MatchListItem[] = data.matches;
        setMatches(serverMatches);
        if (data.user) {
          setCurrentUserState(data.user);
        }
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
    }
  };

  // Sync offline matches on startup
  const syncOfflineMatches = async () => {
    setIsSyncing(true);
    try {
      const email = currentUserState?.email || 'guest';
      const userKey = `olympia_saved_matches_${email}`;
      const guestKey = 'olympia_saved_matches_guest';
      
      const storedUser = localStorage.getItem(userKey);
      const storedGuest = localStorage.getItem(guestKey);
      const listToSync: any[] = [];
      const seenCodes = new Set<string>();

      [storedUser, storedGuest].forEach(raw => {
        if (raw) {
          try {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
              arr.forEach(m => {
                if (m && m.matchCode && !seenCodes.has(m.matchCode.toUpperCase())) {
                  seenCodes.add(m.matchCode.toUpperCase());
                  listToSync.push(m);
                }
              });
            }
          } catch {}
        }
      });

      if (listToSync.length > 0) {
        const data = await safeFetchJson<any>('/api/match/sync', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ matches: listToSync })
        });
        if (data && data.success) {
          fetchMatchesList();
        }
      }
    } catch (err) {
      console.error('Error syncing matches:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchMatchesList();
    syncOfflineMatches();
  }, [currentUserState?.email, sessionTokenState]);

  // Load questions from backend on mount or when matchCode changes
  const loadMatchData = async (codeToLoad: string) => {
    if (!codeToLoad || !codeToLoad.trim()) return;
    isLoadedRef.current = false;
    setLoading(true);
    setStatus({ type: 'info', message: `Đang tải dữ liệu bộ đề ${codeToLoad}...` });
    try {
      const data = await safeFetchJson<any>(`/api/match/${encodeURIComponent(codeToLoad.trim().toUpperCase())}`, {
        headers: getAuthHeaders()
      });
      if (data && data.success && data.match) {
        const m = data.match as MatchDbModel;
        setMatchCode(m.matchCode);
        setMatchName(m.matchName || `Bộ đề ${m.matchCode}`);
        setMatchPassword(m.matchPassword || '123');
        setKhoiDongQs(m.khoi_dong?.cau_hoi || []);
        setVcnvWord(m.vuot_chuong_ngai_vat?.tu_khoa_chinh || '');
        setVcnvImage(m.vuot_chuong_ngai_vat?.anh_goc_url || '');
        setVcnvSoHN(m.vuot_chuong_ngai_vat?.so_hang_ngang === 8 || m.vuot_chuong_ngai_vat?.hang_ngang?.length === 8 ? 8 : 4);
        setVcnvRows(m.vuot_chuong_ngai_vat?.hang_ngang || []);
        setTangTocQs(m.tang_toc?.cau_hoi || []);
        setVeDichQs(m.ve_dich?.cau_hoi || []);
        setCauHoiPhuQs(m.cau_hoi_phu?.cau_hoi || []);
        setMediaNgoai(m.media_ngoai || []);
        setMaTranKepQs(m.ma_tran_kep?.cau_hoi || []);
        setDapAnNhieu(m.ma_tran_kep?.dap_an_nhieu || ['SÔNG AMAZON', 'BẮC KINH', 'KIM CƯƠNG', 'OHM', 'PARIS', 'SẮT', 'CANXI', 'SÔNG NIÊM', 'TOKYO', 'VÀNG', 'LISSABON', 'JOULE', 'SÔNG ĐỒNG NAI', 'CẦN THƠ', 'LÂM ĐỒNG', 'BANGKOK', 'HELI', 'NEON', 'LỤC THỂ', 'AMPE', 'THĂNG LONG', 'BẠCH ĐẰNG', 'VẠN XUÂN', 'ĐẠI VIỆT']);
        if (m.chinh_phuc) {
          setChinhPhucDeQs(m.chinh_phuc.de_cau_hoi?.de || []);
          setChinhPhucTrungBinhQs(m.chinh_phuc.de_cau_hoi?.trung_binh || []);
          setChinhPhucKhoQs(m.chinh_phuc.de_cau_hoi?.kho || []);
          setGmdtQs(m.chinh_phuc.gmdt || []);
        } else {
          initEmptyChinhPhuc();
        }
        if (m.dau_tri && Array.isArray(m.dau_tri.cau_hoi) && m.dau_tri.cau_hoi.length > 0) {
          setDauTriQs(m.dau_tri.cau_hoi);
        } else {
          setDauTriQs(createDefaultDauTriQs());
        }
        if (m.jeopardy) {
          setJeopardyBoardSize(m.jeopardy.boardSize || '5x4');
          setJeopardyCategories(m.jeopardy.categories || createDefaultCategories(m.jeopardy.boardSize || '5x4'));
        } else {
          setJeopardyBoardSize('5x4');
          setJeopardyCategories(createDefaultCategories('5x4'));
        }
        setStatus({ type: 'success', message: `Đã tải bộ đề ${codeToLoad} thành công!` });
      } else {
        initEmptyTemplate(codeToLoad);
        setStatus({ type: 'info', message: `Không tìm thấy bộ đề ${codeToLoad}. Đã khởi tạo bản mẫu trống mới.` });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Lỗi khi tải dữ liệu từ máy chủ.' });
    } finally {
      setLoading(false);
      setTimeout(() => {
        isLoadedRef.current = true;
      }, 500);
    }
  };

  const initEmptyChinhPhuc = () => {
    const cpDe: ChinhPhucQuestion[] = Array.from({ length: 30 }, (_, i) => ({
      id: `CP_DE_${i + 1}`,
      noi_dung: '',
      dap_an_dung: '',
      muc_diem: 10,
      chu_thich: ''
    }));
    const cpTb: ChinhPhucQuestion[] = Array.from({ length: 30 }, (_, i) => ({
      id: `CP_TB_${i + 1}`,
      noi_dung: '',
      dap_an_dung: '',
      muc_diem: 20,
      chu_thich: ''
    }));
    const cpKho: ChinhPhucQuestion[] = Array.from({ length: 30 }, (_, i) => ({
      id: `CP_KHO_${i + 1}`,
      noi_dung: '',
      dap_an_dung: '',
      muc_diem: 30,
      chu_thich: ''
    }));
    const gmdt: GMDTQuestion[] = [
      { mat_ma: '6592222', goi_y: 'Sân chơi trí tuệ học đường cấp Quốc gia', dap_an_dung: 'OLYMPIA' }
    ];
    setChinhPhucDeQs(cpDe);
    setChinhPhucTrungBinhQs(cpTb);
    setChinhPhucKhoQs(cpKho);
    setGmdtQs(gmdt);
  };

  const initEmptyTemplate = (code: string) => {
    // Generate 36 blank Khoi Dong Qs
    const kd: KhoiDongQuestion[] = Array.from({ length: 36 }, (_, i) => ({
      id: `KD_${i + 1}`,
      noi_dung: '',
      dap_an_dung: '',
      chu_thich: '',
      linh_vuc: 'Toán'
    }));

    // Generate 5 rows for VCNV
    const vcnv: ObstacleRow[] = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      cau_hoi: '',
      dap_an: '',
      so_ky_tu: 0
    }));

    // 4 Tang Toc Qs
    const tt: TangTocQuestion[] = Array.from({ length: 4 }, (_, i) => ({
      id: i + 1,
      noi_dung: '',
      dap_an_dung: '',
      thoi_gian: i < 2 ? 20 : 30
    }));

    const ttCaiTien: TangTocCaiTienQuestion[] = Array.from({ length: 4 }, (_, i) => ({
      id: i + 1,
      loai_cau_hoi: i % 2 === 0 ? 3 : 4,
      noi_dung: '',
      dap_an_dung: '',
      goi_y: Array.from({ length: i % 2 === 0 ? 3 : 4 }, (_, h) => ({
        stt: h + 1,
        noi_dung: ''
      }))
    }));

    // 48 Ve Dich Qs (12 for each point level: 10, 20, 30, 40)
    const vd: VeDichQuestion[] = [];
    ([10, 20, 30, 40] as const).forEach((pts) => {
      for (let i = 1; i <= 12; i++) {
        vd.push({
          id: `VD${pts}_${i}`,
          noi_dung: '',
          dap_an_dung: '',
          muc_diem: pts,
          linh_vuc: 'Toán'
        });
      }
    });

    // 25 Cau Hoi Phu Qs
    const chp: CauHoiPhuQuestion[] = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      noi_dung: '',
      dap_an_dung: ''
    }));

    setKhoiDongQs(kd);
    setVcnvWord('');
    setVcnvImage('https://images.unsplash.com/photo-1543731068-7e0f5beff43a?w=800');
    setVcnvRows(vcnv);
    setTangTocQs(tt);
    setTangTocCaiTienQs(ttCaiTien);
    setVeDichQs(vd);
    setCauHoiPhuQs(chp);
    setDauTriQs(createDefaultDauTriQs());
    setMediaNgoai([]);
    setJeopardyBoardSize('5x4');
    setJeopardyCategories(createDefaultCategories('5x4'));
    initEmptyChinhPhuc();
  };

  // Silent Auto-Save handler
  const handleAutoSave = async () => {
    if (!matchCode.trim()) return;
    const finalName = matchName.trim() || `Bộ đề ${matchCode.trim().toUpperCase()}`;
    const payload: MatchDbModel = {
      matchCode: matchCode.trim().toUpperCase(),
      matchName: finalName,
      matchPassword: matchPassword,
      userId: currentUserState?.id,
      ownerEmail: currentUserState?.email,
      ownerName: currentUserState?.fullName,
      khoi_dong: { cau_hoi: khoiDongQs },
      vuot_chuong_ngai_vat: {
        tu_khoa_chinh: vcnvWord.trim().toUpperCase(),
        anh_goc_url: vcnvImage.trim(),
        so_hang_ngang: vcnvSoHN,
        hang_ngang: vcnvRows
      },
      tang_toc: { cau_hoi: tangTocQs, cai_tien_cau_hoi: tangTocCaiTienQs },
      ve_dich: { cau_hoi: veDichQs },
      cau_hoi_phu: { cau_hoi: cauHoiPhuQs },
      jeopardy: { boardSize: jeopardyBoardSize, categories: jeopardyCategories },
      ma_tran_kep: { cau_hoi: maTranKepQs, dap_an_nhieu: dapAnNhieu },
      chinh_phuc: {
        de_cau_hoi: {
          de: chinhPhucDeQs,
          trung_binh: chinhPhucTrungBinhQs,
          kho: chinhPhucKhoQs
        },
        gmdt: gmdtQs
      },
      dau_tri: {
        cau_hoi: dauTriQs
      },
      media_ngoai: mediaNgoai
    };

    try {
      const data = await safeFetchJson<any>('/api/match/save', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (data && data.success) {
        saveLocalBackup(payload);
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        setLastAutoSaveTime(timeStr);
        if (adminCommand && payload.matchCode === activeMatchCode) {
          adminCommand(SocketEvent.ADMIN_LOAD_MATCH, { matchCode: payload.matchCode, matchData: payload });
        }
      }
    } catch (err) {
      console.error('Auto-save error:', err);
    }
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (!isLoadedRef.current || !matchCode.trim()) return;
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      handleAutoSave();
    }, 1200);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [
    matchCode, matchName,
    khoiDongQs, vcnvWord, vcnvImage, vcnvSoHN, vcnvRows,
    tangTocQs, tangTocCaiTienQs, veDichQs, cauHoiPhuQs,
    jeopardyBoardSize, jeopardyCategories, maTranKepQs, dapAnNhieu,
    chinhPhucDeQs, chinhPhucTrungBinhQs, chinhPhucKhoQs, gmdtQs,
    dauTriQs,
    mediaNgoai, matchPassword
  ]);

  const handleSave = async () => {
    if (!matchCode.trim()) {
      setStatus({ type: 'error', message: 'Mã bộ đề không được để trống!' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Đang lưu dữ liệu đề lên máy chủ & tài khoản...' });

    const finalName = matchName.trim() || `Bộ đề ${matchCode.trim().toUpperCase()}`;
    const payload: MatchDbModel = {
      matchCode: matchCode.trim().toUpperCase(),
      matchName: finalName,
      matchPassword: matchPassword,
      userId: currentUserState?.id,
      ownerEmail: currentUserState?.email,
      ownerName: currentUserState?.fullName,
      khoi_dong: { cau_hoi: khoiDongQs },
      vuot_chuong_ngai_vat: {
        tu_khoa_chinh: vcnvWord.trim().toUpperCase(),
        anh_goc_url: vcnvImage.trim(),
        so_hang_ngang: vcnvSoHN,
        hang_ngang: vcnvRows
      },
      tang_toc: { cau_hoi: tangTocQs, cai_tien_cau_hoi: tangTocCaiTienQs },
      ve_dich: { cau_hoi: veDichQs },
      cau_hoi_phu: { cau_hoi: cauHoiPhuQs },
      jeopardy: { boardSize: jeopardyBoardSize, categories: jeopardyCategories },
      ma_tran_kep: { cau_hoi: maTranKepQs, dap_an_nhieu: dapAnNhieu },
      chinh_phuc: {
        de_cau_hoi: {
          de: chinhPhucDeQs,
          trung_binh: chinhPhucTrungBinhQs,
          kho: chinhPhucKhoQs
        },
        gmdt: gmdtQs
      },
      dau_tri: {
        cau_hoi: dauTriQs
      },
      media_ngoai: mediaNgoai
    };

    try {
      const data = await safeFetchJson<any>('/api/match/save', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (data && data.success) {
        saveLocalBackup(payload);
        setStatus({
          type: 'success',
          message: data.message || `Lưu bộ đề [${payload.matchCode}] "${payload.matchName}" thành công!`
        });
        fetchMatchesList();
        // If this saved match code is active or being edited, notify socket to update all clients
        if (adminCommand && payload.matchCode === activeMatchCode) {
          adminCommand(SocketEvent.ADMIN_LOAD_MATCH, { matchCode: payload.matchCode, matchData: payload });
        }
      } else {
        setStatus({ type: 'error', message: data?.message || 'Lưu thất bại.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Lỗi đường truyền kết nối server.' });
    } finally {
      setLoading(false);
    }
  };

  const generateUnique6DigitCode = () => {
    const existing = new Set(matches.map(m => m.matchCode.toUpperCase()));
    for (let i = 0; i < 500; i++) {
      const c = Math.floor(100000 + Math.random() * 900000).toString();
      if (!existing.has(c)) return c;
    }
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Open popup modal for custom match creation
  const handleCreateNewMatch = () => {
    const autoCode = generateUnique6DigitCode();
    setNewMatchCode(autoCode);
    setNewMatchName(`Bộ đề ${autoCode}`);
    setNewMatchPassword('123');
    setNewMatchError('');
    setShowCreateModal(true);
  };

  const handleConfirmCreateNewMatch = async () => {
    if (!newMatchCode.trim()) {
      setNewMatchError('Vui lòng có mã ID bộ đề 6 chữ số!');
      return;
    }
    const trimmedCode = newMatchCode.trim().toUpperCase();
    const finalName = newMatchName.trim() || `Bộ đề ${trimmedCode}`;
    setLoading(true);
    setNewMatchError('');
    try {
      const data = await safeFetchJson<any>('/api/match/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ matchCode: trimmedCode, matchName: finalName, matchPassword: newMatchPassword })
      });
      if (data && data.success) {
        setMatchCode(trimmedCode);
        setMatchName(finalName);
        setMatchPassword(newMatchPassword);
        if (data.match) {
          const m = data.match as MatchDbModel;
          setKhoiDongQs(m.khoi_dong?.cau_hoi || []);
          setVcnvWord(m.vuot_chuong_ngai_vat?.tu_khoa_chinh || '');
          setVcnvImage(m.vuot_chuong_ngai_vat?.anh_goc_url || '');
          setVcnvRows(m.vuot_chuong_ngai_vat?.hang_ngang || []);
          setTangTocQs(m.tang_toc?.cau_hoi || []);
          setVeDichQs(m.ve_dich?.cau_hoi || []);
          setCauHoiPhuQs(m.cau_hoi_phu?.cau_hoi || []);
          saveLocalBackup(m);
        }
        const newMatchItem: MatchListItem = {
          matchCode: trimmedCode,
          matchName: finalName,
          matchPassword: newMatchPassword,
          tu_khoa_chinh: '',
          khoiDongCount: 36,
          vcnvCount: 5,
          tangTocCount: 4,
          veDichCount: 24,
          cauHoiPhuCount: 3,
          isOwner: true,
          updatedAt: new Date().toISOString()
        };
        setMatches(prev => {
          const map = new Map<string, MatchListItem>();
          map.set(trimmedCode, newMatchItem);
          prev.forEach(m => map.set(m.matchCode.toUpperCase(), m));
          return Array.from(map.values());
        });
        setStatus({ type: 'success', message: `Tạo bộ đề mới [${trimmedCode}] "${finalName}" thành công!` });
        fetchMatchesList();
        setShowCreateModal(false);
      } else {
        setNewMatchError(data?.message || 'Lỗi khi tạo bộ đề mới.');
      }
    } catch (err) {
      console.error(err);
      setNewMatchError('Lỗi kết nối máy chủ khi tạo bộ đề.');
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation modal
  const handleDeleteMatch = (codeToDelete: string) => {
    if (!codeToDelete || !codeToDelete.trim()) return;
    setMatchToDelete(codeToDelete.trim().toUpperCase());
  };

  // Perform actual deletion with instant UI sync and server deletion
  const confirmDeleteMatch = async () => {
    if (!matchToDelete) return;
    const code = matchToDelete.trim().toUpperCase();
    setIsDeleting(true);

    try {
      // 1. Immediately delete from local backups
      deleteLocalBackup(code);

      // 2. Optimistically remove from state
      setMatches(prev => prev.filter(m => m.matchCode.toUpperCase() !== code));

      // 3. Request deletion on server
      const data = await safeFetchJson<any>(`/api/match/${encodeURIComponent(code)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (data && data.success) {
        setStatus({ type: 'success', message: `Đã xóa vĩnh viễn bộ đề [${code}] thành công!` });
        // If user is currently editing the deleted match, fallback to OLYMPIA26 or reset
        if (matchCode.toUpperCase() === code) {
          setMatchCode('OLYMPIA26');
          setMatchName('Đề Thi Olympia Mẫu');
          loadMatchData('OLYMPIA26');
        } else {
          fetchMatchesList();
        }
      } else {
        setStatus({ type: 'error', message: data?.message || 'Xóa thất bại từ máy chủ.' });
        fetchMatchesList();
      }
    } catch (err) {
      console.error('Error deleting match:', err);
      setStatus({ type: 'error', message: 'Lỗi kết nối máy chủ khi xóa đề.' });
      fetchMatchesList();
    } finally {
      setIsDeleting(false);
      setMatchToDelete(null);
    }
  };

  // Load a match set as the active playing match immediately (nhập mã đề từ web kho đề và tự động load đề thi)
  const handleActivateMatch = (codeToActivate: string) => {
    if (adminCommand) {
      adminCommand(SocketEvent.ADMIN_LOAD_MATCH, { matchCode: codeToActivate });
      setStatus({ type: 'success', message: `Đã phát lệnh kích hoạt & nạp bộ đề ${codeToActivate} thành công vào hệ thống trận đấu.` });
    } else {
      setStatus({ type: 'error', message: 'Không thể giao tiếp với Socket Server của trận đấu.' });
    }
  };

  // Helper change handlers
  const updateKhoiDongQ = (index: number, field: keyof KhoiDongQuestion, value: string) => {
    const updated = [...khoiDongQs];
    updated[index] = { ...updated[index], [field]: value };
    setKhoiDongQs(updated);
  };

  const updateVcnvRow = (index: number, field: keyof ObstacleRow, value: any) => {
    const updated = [...vcnvRows];
    updated[index] = { ...updated[index], [field]: value };
    setVcnvRows(updated);
  };

  const handleVcnvAnswerChange = (index: number, val: string) => {
    const updated = [...vcnvRows];
    const cleanAnswer = val.toUpperCase();
    const charCount = cleanAnswer.replace(/\s+/g, '').length;
    updated[index] = { 
      ...updated[index], 
      dap_an: cleanAnswer,
      so_ky_tu: charCount
    };
    setVcnvRows(updated);
  };

  const updateTangTocQ = (index: number, field: keyof TangTocQuestion, value: any) => {
    const updated = [...tangTocQs];
    updated[index] = { ...updated[index], [field]: value };
    setTangTocQs(updated);
  };

  const updateVeDichQ = (index: number, field: keyof VeDichQuestion, value: any) => {
    const updated = [...veDichQs];
    updated[index] = { ...updated[index], [field]: value };
    setVeDichQs(updated);
  };

  const updateCauHoiPhuQ = (index: number, field: keyof CauHoiPhuQuestion, value: any) => {
    const updated = [...cauHoiPhuQs];
    updated[index] = { ...updated[index], [field]: value };
    setCauHoiPhuQs(updated);
  };

  const handleOpenEditModal = (
    round: 'KHOI_DONG' | 'VE_DICH' | 'CHINH_PHUC_DE' | 'CHINH_PHUC_TB' | 'CHINH_PHUC_KHO',
    question?: any,
    suggestedPoints?: 10 | 20 | 30 | 40
  ) => {
    if (question) {
      setEditQuestionModal({
        isOpen: true,
        round,
        questionId: question.id,
      });
      setDraftLinhVuc(normalizeLinhVuc(question.linh_vuc || 'Toán'));
      setDraftNoiDung(question.noi_dung || '');
      setDraftDapAnDung(question.dap_an_dung || '');
      setDraftChuThich(question.chu_thich || '');
      setDraftMucDiem(question.muc_diem || (round === 'CHINH_PHUC_DE' ? 10 : round === 'CHINH_PHUC_TB' ? 20 : round === 'CHINH_PHUC_KHO' ? 30 : 20));
      setDraftMediaUrl(question.media?.url || '');
      setDraftMediaType(question.media?.type || 'image');
    } else {
      setEditQuestionModal({
        isOpen: true,
        round,
        questionId: '',
        suggestedPoints,
      });
      setDraftLinhVuc('Toán');
      setDraftNoiDung('');
      setDraftDapAnDung('');
      setDraftChuThich('');
      setDraftMucDiem(suggestedPoints || (round === 'CHINH_PHUC_DE' ? 10 : round === 'CHINH_PHUC_TB' ? 20 : round === 'CHINH_PHUC_KHO' ? 30 : 20));
      setDraftMediaUrl('');
      setDraftMediaType('image');
    }
  };

  const handleSaveQuestionFromModal = () => {
    if (!editQuestionModal) return;
    const { round, questionId } = editQuestionModal;

    const mediaObj = draftMediaUrl.trim() 
      ? { url: draftMediaUrl.trim(), type: draftMediaType } 
      : undefined;

    if (round === 'KHOI_DONG') {
      if (questionId) {
        setKhoiDongQs(prev => prev.map(q => q.id === questionId ? {
          ...q,
          linh_vuc: draftLinhVuc,
          noi_dung: draftNoiDung,
          dap_an_dung: draftDapAnDung.toUpperCase(),
          chu_thich: draftChuThich,
          media: mediaObj
        } : q));
      } else {
        const newId = `KD_${Date.now()}`;
        setKhoiDongQs(prev => [...prev, {
          id: newId,
          linh_vuc: draftLinhVuc,
          noi_dung: draftNoiDung,
          dap_an_dung: draftDapAnDung.toUpperCase(),
          chu_thich: draftChuThich,
          media: mediaObj
        }]);
      }
    } else if (round === 'VE_DICH') {
      if (questionId) {
        setVeDichQs(prev => prev.map(q => q.id === questionId ? {
          ...q,
          linh_vuc: draftLinhVuc,
          noi_dung: draftNoiDung,
          dap_an_dung: draftDapAnDung.toUpperCase(),
          chu_thich: draftChuThich,
          muc_diem: draftMucDiem,
          media: mediaObj
        } : q));
      } else {
        const points = draftMucDiem || 20;
        const countOfSamePoints = veDichQs.filter(q => q.muc_diem === points).length;
        const newId = `VD_${points}_${countOfSamePoints + 1}`;
        setVeDichQs(prev => [...prev, {
          id: newId,
          linh_vuc: draftLinhVuc,
          noi_dung: draftNoiDung,
          dap_an_dung: draftDapAnDung.toUpperCase(),
          chu_thich: draftChuThich,
          muc_diem: draftMucDiem,
          media: mediaObj
        }]);
      }
    } else if (round === 'CHINH_PHUC_DE') {
      if (questionId) {
        setChinhPhucDeQs(prev => prev.map(q => q.id === questionId ? {
          ...q,
          noi_dung: draftNoiDung,
          dap_an_dung: draftDapAnDung.toUpperCase(),
          chu_thich: draftChuThich,
          muc_diem: 10,
          media: mediaObj
        } : q));
      } else {
        const newId = `CP_DE_${Date.now()}`;
        setChinhPhucDeQs(prev => [...prev, {
          id: newId,
          noi_dung: draftNoiDung,
          dap_an_dung: draftDapAnDung.toUpperCase(),
          chu_thich: draftChuThich,
          muc_diem: 10,
          media: mediaObj
        }]);
      }
    } else if (round === 'CHINH_PHUC_TB') {
      if (questionId) {
        setChinhPhucTrungBinhQs(prev => prev.map(q => q.id === questionId ? {
          ...q,
          noi_dung: draftNoiDung,
          dap_an_dung: draftDapAnDung.toUpperCase(),
          chu_thich: draftChuThich,
          muc_diem: 20,
          media: mediaObj
        } : q));
      } else {
        const newId = `CP_TB_${Date.now()}`;
        setChinhPhucTrungBinhQs(prev => [...prev, {
          id: newId,
          noi_dung: draftNoiDung,
          dap_an_dung: draftDapAnDung.toUpperCase(),
          chu_thich: draftChuThich,
          muc_diem: 20,
          media: mediaObj
        }]);
      }
    } else if (round === 'CHINH_PHUC_KHO') {
      if (questionId) {
        setChinhPhucKhoQs(prev => prev.map(q => q.id === questionId ? {
          ...q,
          noi_dung: draftNoiDung,
          dap_an_dung: draftDapAnDung.toUpperCase(),
          chu_thich: draftChuThich,
          muc_diem: 30,
          media: mediaObj
        } : q));
      } else {
        const newId = `CP_KHO_${Date.now()}`;
        setChinhPhucKhoQs(prev => [...prev, {
          id: newId,
          noi_dung: draftNoiDung,
          dap_an_dung: draftDapAnDung.toUpperCase(),
          chu_thich: draftChuThich,
          muc_diem: 30,
          media: mediaObj
        }]);
      }
    }

    setEditQuestionModal(null);
    setStatus({ type: 'info', message: 'Đã cập nhật câu hỏi tạm thời. Nhấn "LƯU TOÀN BỘ ĐỀ THI LÊN HỆ THỐNG" để đồng bộ vĩnh viễn.' });
  };

  const handleDeleteQuestionFromModal = () => {
    if (!editQuestionModal || !editQuestionModal.questionId) return;
    const { round, questionId } = editQuestionModal;

    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi danh sách tạm thời?')) {
      if (round === 'KHOI_DONG') {
        setKhoiDongQs(prev => prev.filter(q => q.id !== questionId));
      } else if (round === 'VE_DICH') {
        setVeDichQs(prev => prev.filter(q => q.id !== questionId));
      } else if (round === 'CHINH_PHUC_DE') {
        setChinhPhucDeQs(prev => prev.filter(q => q.id !== questionId));
      } else if (round === 'CHINH_PHUC_TB') {
        setChinhPhucTrungBinhQs(prev => prev.filter(q => q.id !== questionId));
      } else if (round === 'CHINH_PHUC_KHO') {
        setChinhPhucKhoQs(prev => prev.filter(q => q.id !== questionId));
      }
      setEditQuestionModal(null);
      setStatus({ type: 'info', message: 'Đã xóa câu hỏi tạm thời. Nhấn "LƯU TOÀN BỘ ĐỀ THI LÊN HỆ THỐNG" để đồng bộ vĩnh viễn.' });
    }
  };

  const updateGmdtQ = (index: number, field: keyof GMDTQuestion, value: string) => {
    setGmdtQs(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addGmdtQ = () => {
    setGmdtQs(prev => [
      ...prev,
      { mat_ma: '', goi_y: '', dap_an_dung: '' }
    ]);
  };

  const deleteGmdtQ = (index: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi GMĐT này?')) {
      setGmdtQs(prev => prev.filter((_, i) => i !== index));
    }
  };

  const openMediaModal = (
    round: 'KHOI_DONG' | 'VCNV' | 'TANG_TOC_Q' | 'TANG_TOC_A' | 'VE_DICH',
    index: number,
    existingMedia?: any
  ) => {
    setMediaModalState({
      isOpen: true,
      round,
      index,
      url: existingMedia?.url || '',
      type: existingMedia?.type || 'image'
    });
  };

  const handleSaveMedia = (url: string, type: 'image' | 'video' | 'audio') => {
    if (!mediaModalState) return;
    const { round, index } = mediaModalState;
    const cleanUrl = url.trim();

    let finalType = type;
    if (cleanUrl) {
      const lower = cleanUrl.toLowerCase();
      if (lower.match(/\.(mp3|wav|ogg|m4a|aac|flac)($|\?)/)) {
        finalType = 'audio';
      } else if ((lower.match(/\.(mp4|webm|mov)($|\?)/) || lower.includes('youtube.com') || lower.includes('youtu.be')) && finalType !== 'audio') {
        finalType = 'video';
      }
    }

    const mediaObj = cleanUrl ? { url: cleanUrl, type: finalType } : undefined;

    if (round === 'KHOI_DONG') {
      const updated = [...khoiDongQs];
      updated[index] = { ...updated[index], media: mediaObj };
      setKhoiDongQs(updated);
    } else if (round === 'VCNV') {
      const updated = [...vcnvRows];
      updated[index] = { ...updated[index], media: mediaObj };
      setVcnvRows(updated);
    } else if (round === 'TANG_TOC_Q') {
      const updated = [...tangTocQs];
      updated[index] = { ...updated[index], media: mediaObj };
      setTangTocQs(updated);
    } else if (round === 'TANG_TOC_A') {
      const updated = [...tangTocQs];
      updated[index] = { ...updated[index], media_dap_an: mediaObj };
      setTangTocQs(updated);
    } else if (round === 'VE_DICH') {
      const updated = [...veDichQs];
      updated[index] = { ...updated[index], media: mediaObj };
      setVeDichQs(updated);
    }

    setMediaModalState(null);
  };

  // Helper to extract media object from excel row
  const getMediaFromRow = (r: any) => {
    const url = r["Đường Dẫn Media (URL)"] || r["Đường Dẫn Media"] || r["Ảnh Minh Họa URL (Nếu Có)"] || r["Media URL"] || r["Media"] || r["Ảnh Minh Họa URL"] || "";
    const typeVal = r["Loại Media"] || r["Loại Media (image/audio/video)"] || r["Media Type"] || "image";
    
    const trimmedUrl = String(url || "").trim();
    if (!trimmedUrl) return undefined;
    
    // Normalize type
    let normalizedType: 'image' | 'audio' | 'video' = 'image';
    const t = String(typeVal).toLowerCase().trim();
    if (t.includes("audio") || t.includes("âm") || t === "mp3" || t === "sound") {
      normalizedType = 'audio';
    } else if (t.includes("video") || t.includes("clip") || t.includes("mp4") || t === "phim") {
      normalizedType = 'video';
    }
    
    return {
      url: trimmedUrl,
      type: normalizedType
    };
  };

  // Export current active match questions to excel file
  const exportCurrentMatchExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1. Khởi Động sheet
    const kdData = khoiDongQs.map((q, idx) => ({
      "ID": q.id || `KD_${idx + 1}`,
      "Lĩnh Vực": q.linh_vuc || "Toán",
      "Nội Dung Câu Hỏi": q.noi_dung || "",
      "Đáp Án Đúng": q.dap_an_dung || "",
      "Chú Thích": q.chu_thich || "",
      "Đường Dẫn Media (URL)": q.media?.url || "",
      "Loại Media (image/audio/video)": q.media?.type || "image"
    }));
    const kdWs = XLSX.utils.json_to_sheet(kdData);
    XLSX.utils.book_append_sheet(wb, kdWs, "Khởi Động");

    // 2. VCNV sheet
    const vcnvMeta = [
      ["Từ Khóa Chính Chướng Ngại Vật", vcnvWord || ""],
      ["Ảnh Nền Gốc URL", vcnvImage || ""],
      ["Số HN", vcnvSoHN || 4],
      ["ID Hàng Ngang", "Câu Hỏi Gợi Ý", "Đáp Án", "Số Ký Tự Ô Chữ", "Đường Dẫn Media (URL)", "Loại Media (image/audio/video)"]
    ];
    const vcnvRowsAoa = vcnvRows.map((r) => [
      r.id,
      r.cau_hoi || "",
      r.dap_an || "",
      r.so_ky_tu || 5,
      r.media?.url || "",
      r.media?.type || "image"
    ]);
    const vcnvWs = XLSX.utils.aoa_to_sheet([...vcnvMeta, ...vcnvRowsAoa]);
    XLSX.utils.book_append_sheet(wb, vcnvWs, "Vượt Chướng Ngại Vật");

    // 3. Tăng Tốc sheet
    const ttData = tangTocQs.map((q) => ({
      "ID": q.id,
      "Nội Dung Mô Tả": q.noi_dung || "",
      "Đáp Án Đúng": q.dap_an_dung || "",
      "Thời Gian (Giây)": q.thoi_gian || 30,
      "Giải Thích": q.chu_thich || "",
      "Đường Dẫn Media (URL)": q.media?.url || "",
      "Loại Media (image/audio/video)": q.media?.type || "image"
    }));
    const ttWs = XLSX.utils.json_to_sheet(ttData);
    XLSX.utils.book_append_sheet(wb, ttWs, "Tăng Tốc");

    // 3.5 Tăng Tốc - Cải Tiến sheet
    const ttCaiTienAoa: any[][] = [];
    tangTocCaiTienQs.forEach((q) => {
      ttCaiTienAoa.push([q.id, q.noi_dung || "", q.dap_an_dung || "", q.loai_cau_hoi || 3]);
      ttCaiTienAoa.push(["STT Gợi Ý", "Nội Dung Gợi Ý", "Media URL (nếu có)"]);
      for (let h = 1; h <= 4; h++) {
        const g = q.goi_y.find(item => item.stt === h);
        ttCaiTienAoa.push([h, g?.noi_dung || "", g?.media?.url || ""]);
      }
      ttCaiTienAoa.push([]);
    });
    const ttCaiTienWs = XLSX.utils.aoa_to_sheet(ttCaiTienAoa);
    XLSX.utils.book_append_sheet(wb, ttCaiTienWs, "Tăng tốc_Cải tiến");

    // 4. Về Đích sheet
    const vdData = veDichQs.map((q, idx) => {
      let fallbackId = q.id;
      if (!fallbackId) {
        const countBefore = veDichQs.slice(0, idx).filter(x => x.muc_diem === q.muc_diem).length;
        fallbackId = `VD_${q.muc_diem || 20}_${countBefore + 1}`;
      }
      return {
        "ID": fallbackId,
        "Mức Điểm": q.muc_diem || 20,
        "Lĩnh Vực": q.linh_vuc || "Toán",
        "Nội Dung Câu Hỏi": q.noi_dung || "",
        "Đáp Án Đúng": q.dap_an_dung || "",
        "Giải Thích": q.chu_thich || "",
        "Đường Dẫn Media (URL)": q.media?.url || "",
        "Loại Media (image/audio/video)": q.media?.type || "image"
      };
    });
    const vdWs = XLSX.utils.json_to_sheet(vdData);
    XLSX.utils.book_append_sheet(wb, vdWs, "Về Đích");

    // 5. Câu Hỏi Phụ sheet
    const chpData = cauHoiPhuQs.map((q) => ({
      "ID": q.id,
      "Nội Dung Câu Hỏi Phụ": q.noi_dung || "",
      "Đáp Án Đúng": q.dap_an_dung || "",
      "Đường Dẫn Media (URL)": q.media?.url || "",
      "Loại Media (image/audio/video)": q.media?.type || "image"
    }));
    const chpWs = XLSX.utils.json_to_sheet(chpData);
    XLSX.utils.book_append_sheet(wb, chpWs, "Câu Hỏi Phụ");

    // 6. Media Ngoài sheet
    const mediaData = mediaNgoai.map((item, idx) => ({
      "ID": item.id || `MEDIA_${idx + 1}`,
      "Tên Media": item.name || "",
      "Đường Dẫn (URL)": item.url || "",
      "Loại Media (AUDIO/IMAGE/VIDEO)": (item.type || "image").toUpperCase()
    }));
    const mediaWs = XLSX.utils.json_to_sheet(mediaData);
    XLSX.utils.book_append_sheet(wb, mediaWs, "Media");

    // 6.5 Jeopardy sheet
    const jpBoardSize = jeopardyBoardSize || '5x4';
    const jpAoa: any[][] = [
      ["Kích Thước Bảng", jpBoardSize],
      ["CATEGORY", "POINTS", "QUESTION", "ANSWER", "MEDIA LINK", "MEDIA TYPE"]
    ];
    (jeopardyCategories || []).forEach((cat, cIdx) => {
      (cat.clues || []).forEach((clue: any, kIdx: number) => {
        jpAoa.push([
          kIdx === 0 ? (cat.title || `CHỦ ĐỀ ${cIdx + 1}`) : "",
          clue.points !== undefined && clue.points !== null && !isNaN(Number(clue.points)) ? Number(clue.points) : (kIdx + 1) * 10,
          clue.question || "",
          clue.dap_an_dung || "",
          clue.media?.url || "",
          clue.media?.url ? (clue.media?.type || "image").toUpperCase() : ""
        ]);
      });
    });
    const jpWs = XLSX.utils.aoa_to_sheet(jpAoa);
    jpWs['!cols'] = [
      { wch: 25 },
      { wch: 8 },
      { wch: 65 },
      { wch: 25 },
      { wch: 35 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, jpWs, "Jeopardy");

    // 6.6 Ma Trận Kép sheet
    const mtkData = maTranKepQs.map((q, idx) => ({
      "STT": idx + 1,
      "Nội Dung Câu Hỏi": q.noi_dung || "",
      "Đáp Án 1": q.dap_an_1 || "",
      "Đáp Án 2": q.dap_an_2 || "",
      "Đáp Án Nhiễu 1": dapAnNhieu[idx * 2] || "",
      "Đáp Án Nhiễu 2": dapAnNhieu[idx * 2 + 1] || ""
    }));
    const mtkExportWs = XLSX.utils.json_to_sheet(mtkData);
    mtkExportWs['!cols'] = [
      { wch: 8 },
      { wch: 50 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 }
    ];
    XLSX.utils.book_append_sheet(wb, mtkExportWs, "Ma Trận Kép");

    // 6.7 Chinh Phục & GMĐT sheet (Gom chung: GMDT lên trên cùng, 90 câu Chinh Phục ở dưới)
    const gmdtItem = gmdtQs[0] || { goi_y: '', dap_an_dung: '', mat_ma: '' };
    const cpRows: any[][] = [
      ["=== MINIGAME GIẢI MÃ ĐIỆN THOẠI (GMĐT) ==="],
      ["", "", "Gợi Ý GMĐT", "Đáp Án Cuối GMĐT"],
      ["", "", gmdtItem.goi_y || "", gmdtItem.dap_an_dung || ""],
      [],
      ["=== CÂU HỎI CHINH PHỤC (90 CÂU: 30 DỄ, 30 TRUNG BÌNH, 30 KHÓ) ==="],
      ["STT", "Mức Điểm", "Nội Dung Câu Hỏi", "Đáp Án Đúng", "Chú Thích", "Đường Dẫn Media (URL)", "Loại Media (image/audio/video)"]
    ];

    let cpIdx = 1;
    // Dễ (tối đa 30)
    chinhPhucDeQs.slice(0, 30).forEach(q => {
      cpRows.push([
        cpIdx++,
        10,
        q.noi_dung || "",
        q.dap_an_dung || "",
        q.chu_thich || "",
        q.media?.url || "",
        q.media?.type || "image"
      ]);
    });
    // Trung Bình (tối đa 30)
    chinhPhucTrungBinhQs.slice(0, 30).forEach(q => {
      cpRows.push([
        cpIdx++,
        20,
        q.noi_dung || "",
        q.dap_an_dung || "",
        q.chu_thich || "",
        q.media?.url || "",
        q.media?.type || "image"
      ]);
    });
    // Khó (tối đa 30)
    chinhPhucKhoQs.slice(0, 30).forEach(q => {
      cpRows.push([
        cpIdx++,
        30,
        q.noi_dung || "",
        q.dap_an_dung || "",
        q.chu_thich || "",
        q.media?.url || "",
        q.media?.type || "image"
      ]);
    });

    const cpWs = XLSX.utils.aoa_to_sheet(cpRows);
    cpWs['!cols'] = [
      { wch: 8 },
      { wch: 12 },
      { wch: 50 },
      { wch: 25 },
      { wch: 30 },
      { wch: 30 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, cpWs, "Chinh Phục");

    // 6.8 Đấu Trí - Sheet Câu hỏi chính (25 câu hỏi chính)
    const dauTriMainExport = dauTriQs.map((q, idx) => ({
      "STT": q.id || (idx + 1),
      "Nội Dung Câu Hỏi Chính": q.noi_dung || "",
      "Đáp Án Câu Chính": q.dap_an_dung || "",
      "Giải Thích Câu Chính": q.chu_thich || "",
      "Media Câu Chính (URL)": q.media?.url || "",
      "Loại Media Câu Chính": q.media?.type || "image"
    }));
    const dtWs = XLSX.utils.json_to_sheet(dauTriMainExport);
    dtWs['!cols'] = [
      { wch: 6 },
      { wch: 50 },
      { wch: 25 },
      { wch: 30 },
      { wch: 30 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, dtWs, "Đấu Trí");

    // 6.9 Đấu trí_Câu thưởng - Sheet Gói câu hỏi thưởng (Layout dọc từng dòng liên tục, STT và Chủ đề chỉ hiển thị 1 lần mỗi gói)
    const dauTriBonusExport: any[] = [];
    dauTriQs.forEach((q, idx) => {
      const packId = q.id || (idx + 1);
      const theme = q.goi_thuong?.chu_de || `Chủ đề thưởng ${idx + 1}`;
      const bList = q.goi_thuong?.cau_hoi || [];
      [0, 1, 2].forEach(bIdx => {
        const b = bList[bIdx];
        dauTriBonusExport.push({
          "Gói STT": bIdx === 0 ? packId : "",
          "Chủ Đề Gói Thưởng": bIdx === 0 ? theme : "",
          "Câu Thưởng Số": bIdx + 1,
          "Nội Dung Câu Hỏi Thưởng": b?.noi_dung || "",
          "Đáp Án Thưởng": b?.dap_an_dung || "",
          "Giải Thích Thưởng": b?.chu_thich || "",
          "Media Thưởng (URL)": b?.media?.url || "",
          "Loại Media Thưởng": b?.media?.type || "image"
        });
      });
    });
    const dtBonusWs = XLSX.utils.json_to_sheet(dauTriBonusExport);
    dtBonusWs['!cols'] = [
      { wch: 10 },
      { wch: 30 },
      { wch: 14 },
      { wch: 50 },
      { wch: 25 },
      { wch: 30 },
      { wch: 30 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, dtBonusWs, "Đấu trí_Câu thưởng");

    // 7. Cài đặt sheet
    const settingsData = [
      { "Phần / Vòng Thi": "Khởi Động", "Mã Vòng": "KHOI_DONG", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật Khởi Động, 0 để giữ nguyên" },
      { "Phần / Vòng Thi": "Vượt Chướng Ngại Vật", "Mã Vòng": "VCNV", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật VCNV, 0 để giữ nguyên" },
      { "Phần / Vòng Thi": "Tăng Tốc", "Mã Vòng": "TANG_TOC", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật Tăng Tốc, 0 để giữ nguyên" },
      { "Phần / Vòng Thi": "Về Đích", "Mã Vòng": "VE_DICH", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật Về Đích, 0 để giữ nguyên" },
      { "Phần / Vòng Thi": "Câu Hỏi Phụ", "Mã Vòng": "CH_PHU", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật Câu Hỏi Phụ, 0 để giữ nguyên" },
      { "Phần / Vòng Thi": "Media Ngoài", "Mã Vòng": "MEDIA", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật danh sách Media ngoài, 0 để giữ nguyên" },
      { "Phần / Vòng Thi": "Jeopardy!", "Mã Vòng": "JEOPARDY", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật Jeopardy!, 0 để giữ nguyên (Tự động nhận diện 5x4 hoặc 6x5 theo ô B1 sheet Jeopardy)" },
      { "Phần / Vòng Thi": "Ma Trận Kép", "Mã Vòng": "MA_TRAN_KEP", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật Ma Trận Kép (12 câu hỏi, mỗi câu 2 đáp án)" },
      { "Phần / Vòng Thi": "Chinh Phục & GMĐT", "Mã Vòng": "CHINH_PHUC", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật Chinh Phục & GMĐT, 0 để giữ nguyên" },
      { "Phần / Vòng Thi": "Đấu Trí", "Mã Vòng": "DAU_TRI", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật Đấu Trí & Đấu trí_Câu thưởng khi nạp file, 0 để giữ nguyên" }
    ];
    const settingsWs = XLSX.utils.json_to_sheet(settingsData);
    XLSX.utils.book_append_sheet(wb, settingsWs, "Cài đặt");

    XLSX.writeFile(wb, `olympia_de_thi_${matchCode}.xlsx`);
  };

  // Export a professional, blank template file with highly detailed realistic sample rows for user reference
  const downloadExcelTemplate = () => {
    const wb = XLSX.utils.book_new();

    // 1. Khởi Động template sheet
    const kdSamples = [
      {
        "ID": "KD_1",
        "Lĩnh Vực": "Toán",
        "Nội Dung Câu Hỏi": "Có bao nhiêu số nguyên tố nhỏ hơn 10?",
        "Đáp Án Đúng": "4",
        "Chú Thích": "Các số nguyên tố đó là: 2, 3, 5, 7.",
        "Đường Dẫn Media (URL)": "",
        "Loại Media (image/audio/video)": "image"
      },
      {
        "ID": "KD_2",
        "Lĩnh Vực": "Văn",
        "Nội Dung Câu Hỏi": "Tác phẩm Truyện Kiều của ai?",
        "Đáp Án Đúng": "NGUYỄN DU",
        "Chú Thích": "Thi hào dân tộc Nguyễn Du.",
        "Đường Dẫn Media (URL)": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Portrait_of_Nguyen_Du.jpg",
        "Loại Media (image/audio/video)": "image"
      }
    ];
    // Fill up the rest with empty templates
    for (let i = 3; i <= 36; i++) {
      kdSamples.push({
        "ID": `KD_${i}`,
        "Lĩnh Vực": LING_VUC_OPTIONS[(i - 1) % LING_VUC_OPTIONS.length],
        "Nội Dung Câu Hỏi": "",
        "Đáp Án Đúng": "",
        "Chú Thích": "",
        "Đường Dẫn Media (URL)": "",
        "Loại Media (image/audio/video)": "image"
      });
    }
    const kdWs = XLSX.utils.json_to_sheet(kdSamples);
    XLSX.utils.book_append_sheet(wb, kdWs, "Khởi Động");

    // 2. VCNV template sheet
    const vcnvMeta = [
      ["Từ Khóa Chính Chướng Ngại Vật", "ĐƯỜNG LÊN ĐỈNH OLYMPIA"],
      ["Ảnh Nền Gốc URL", "https://images.unsplash.com/photo-1543731068-7e0f5beff43a?w=800"],
      ["Số HN", vcnvSoHN || 4],
      ["ID Hàng Ngang", "Câu Hỏi Gợi Ý", "Đáp Án", "Số Ký Tự Ô Chữ", "Đường Dẫn Media (URL)", "Loại Media (image/audio/video)"]
    ];
    const vcnvRowsAoa = [
      [1, "Hàng ngang gợi ý mẫu số 1", "DAP_AN_1", 8, "", "image"],
      [2, "Hàng ngang gợi ý mẫu số 2", "DAP_AN_2", 6, "", "image"],
      [3, "", "", 5, "", "image"],
      [4, "", "", 5, "", "image"],
      [5, "", "", 5, "", "image"]
    ];
    const vcnvWs = XLSX.utils.aoa_to_sheet([...vcnvMeta, ...vcnvRowsAoa]);
    XLSX.utils.book_append_sheet(wb, vcnvWs, "Vượt Chướng Ngại Vật");

    // 3. Tăng Tốc template sheet
    const ttSamples = [
      {
        "ID": 1,
        "Nội Dung Mô Tả": "Nhìn hình ảnh sau và đoán câu chữ tương ứng?",
        "Đáp Án Đúng": "BÀN THỜ",
        "Thời Gian (Giây)": 30,
        "Giải Thích": "Hình ảnh bàn thờ gia tiên Việt Nam.",
        "Đường Dẫn Media (URL)": "https://example.com/sample.jpg",
        "Loại Media (image/audio/video)": "image"
      }
    ];
    for (let i = 2; i <= 4; i++) {
      ttSamples.push({
        "ID": i,
        "Nội Dung Mô Tả": "",
        "Đáp Án Đúng": "",
        "Thời Gian (Giây)": 30,
        "Giải Thích": "",
        "Đường Dẫn Media (URL)": "",
        "Loại Media (image/audio/video)": "image"
      });
    }
    const ttWs = XLSX.utils.json_to_sheet(ttSamples);
    XLSX.utils.book_append_sheet(wb, ttWs, "Tăng Tốc");

    // 3.5 Tăng Tốc - Cải Tiến template sheet
    const ttCaiTienAoa: any[][] = [];
    ttCaiTienAoa.push([1, "Đây là địa danh/khái niệm nào?", "HÀ NỘI", 3]);
    ttCaiTienAoa.push(["STT Gợi Ý", "Nội Dung Gợi Ý", "Media URL (nếu có)"]);
    ttCaiTienAoa.push([1, "Thành phố vì hòa bình, thủ đô của Việt Nam.", ""]);
    ttCaiTienAoa.push([2, "Nơi có Hồ Hoàn Kiếm, Chùa Một Cột, Quảng trường Ba Đình.", ""]);
    ttCaiTienAoa.push([3, "Tên gọi trước đây là Thăng Long, Đông Đô.", ""]);
    ttCaiTienAoa.push([4, "", ""]);
    ttCaiTienAoa.push([]);

    ttCaiTienAoa.push([2, "Đây là nhân vật lịch sử nào?", "QUANG TRUNG", 4]);
    ttCaiTienAoa.push(["STT Gợi Ý", "Nội Dung Gợi Ý", "Media URL (nếu có)"]);
    ttCaiTienAoa.push([1, "Vị anh hùng dân tộc áo vải cờ đào.", ""]);
    ttCaiTienAoa.push([2, "Đánh tan 29 vạn quân Thanh vào mùa xuân Kỷ Dậu 1789.", ""]);
    ttCaiTienAoa.push([3, "Tên thật là Nguyễn Huệ.", ""]);
    ttCaiTienAoa.push([4, "Xung đế hiệu tại Phú Xuân (Huế).", ""]);
    ttCaiTienAoa.push([]);

    ttCaiTienAoa.push([3, "", "", 3]);
    ttCaiTienAoa.push(["STT Gợi Ý", "Nội Dung Gợi Ý", "Media URL (nếu có)"]);
    ttCaiTienAoa.push([1, "", ""]);
    ttCaiTienAoa.push([2, "", ""]);
    ttCaiTienAoa.push([3, "", ""]);
    ttCaiTienAoa.push([4, "", ""]);
    ttCaiTienAoa.push([]);

    ttCaiTienAoa.push([4, "", "", 4]);
    ttCaiTienAoa.push(["STT Gợi Ý", "Nội Dung Gợi Ý", "Media URL (nếu có)"]);
    ttCaiTienAoa.push([1, "", ""]);
    ttCaiTienAoa.push([2, "", ""]);
    ttCaiTienAoa.push([3, "", ""]);
    ttCaiTienAoa.push([4, "", ""]);

    const ttCaiTienWs = XLSX.utils.aoa_to_sheet(ttCaiTienAoa);
    XLSX.utils.book_append_sheet(wb, ttCaiTienWs, "Tăng tốc_Cải tiến");

    // 4. Về Đích template sheet
    const vdSamples = [];
    // 12 x 10-point questions
    for (let i = 1; i <= 12; i++) {
      vdSamples.push({
        "ID": `VD_10_${i}`,
        "Mức Điểm": 10,
        "Lĩnh Vực": LING_VUC_OPTIONS[i % LING_VUC_OPTIONS.length],
        "Nội Dung Câu Hỏi": i === 1 ? "Thủ đô của Việt Nam là thành phố nào?" : "",
        "Đáp Án Đúng": i === 1 ? "HÀ NỘI" : "",
        "Giải Thích": i === 1 ? "Hà Nội là thủ đô của Nước CHXHCN Việt Nam." : "",
        "Đường Dẫn Media (URL)": "",
        "Loại Media (image/audio/video)": "image"
      });
    }
    // 12 x 20-point questions
    for (let i = 1; i <= 12; i++) {
      vdSamples.push({
        "ID": `VD_20_${i}`,
        "Mức Điểm": 20,
        "Lĩnh Vực": LING_VUC_OPTIONS[i % LING_VUC_OPTIONS.length],
        "Nội Dung Câu Hỏi": i === 1 ? "Số nguyên tố chẵn duy nhất là số nào?" : "",
        "Đáp Án Đúng": i === 1 ? "2" : "",
        "Giải Thích": i === 1 ? "Số 2 là số nguyên tố chẵn duy nhất." : "",
        "Đường Dẫn Media (URL)": "",
        "Loại Media (image/audio/video)": "image"
      });
    }
    // 12 x 30-point questions
    for (let i = 1; i <= 12; i++) {
      vdSamples.push({
        "ID": `VD_30_${i}`,
        "Mức Điểm": 30,
        "Lĩnh Vực": LING_VUC_OPTIONS[i % LING_VUC_OPTIONS.length],
        "Nội Dung Câu Hỏi": i === 1 ? "Tỉnh nào ở nước ta giáp cả Lào và Campuchia?" : "",
        "Đáp Án Đúng": i === 1 ? "KON TUM" : "",
        "Giải Thích": i === 1 ? "Ngã ba Đông Dương nằm ở tỉnh Kon Tum." : "",
        "Đường Dẫn Media (URL)": "",
        "Loại Media (image/audio/video)": "image"
      });
    }
    // 12 x 40-point questions
    for (let i = 1; i <= 12; i++) {
      vdSamples.push({
        "ID": `VD_40_${i}`,
        "Mức Điểm": 40,
        "Lĩnh Vực": LING_VUC_OPTIONS[i % LING_VUC_OPTIONS.length],
        "Nội Dung Câu Hỏi": i === 1 ? "Thành phần chính cấu tạo nên kim cương và than chì là nguyên tố hóa học nào?" : "",
        "Đáp Án Đúng": i === 1 ? "CACBON" : "",
        "Giải Thích": i === 1 ? "Kim cương và than chì là các dạng thù hình của Cacbon (C)." : "",
        "Đường Dẫn Media (URL)": "",
        "Loại Media (image/audio/video)": "image"
      });
    }
    const vdWs = XLSX.utils.json_to_sheet(vdSamples);
    XLSX.utils.book_append_sheet(wb, vdWs, "Về Đích");

    // 5. Câu Hỏi Phụ template sheet
    const chpSamples = [
      {
        "ID": 1,
        "Nội Dung Câu Hỏi Phụ": "Hành tinh nào gần Mặt Trời nhất?",
        "Đáp Án Đúng": "SAO THỦY",
        "Đường Dẫn Media (URL)": "",
        "Loại Media (image/audio/video)": "image"
      }
    ];
    for (let i = 2; i <= 25; i++) {
      chpSamples.push({
        "ID": i,
        "Nội Dung Câu Hỏi Phụ": "",
        "Đáp Án Đúng": "",
        "Đường Dẫn Media (URL)": "",
        "Loại Media (image/audio/video)": "image"
      });
    }
    const chpWs = XLSX.utils.json_to_sheet(chpSamples);
    XLSX.utils.book_append_sheet(wb, chpWs, "Câu Hỏi Phụ");

    // 6. Media Ngoài template sheet
    const mediaSamples = [
      {
        "ID": "MEDIA_1",
        "Tên Media": "Nhạc Hiệu Intro Olympia",
        "Đường Dẫn (URL)": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
        "Loại Media (AUDIO/IMAGE/VIDEO)": "AUDIO"
      },
      {
        "ID": "MEDIA_2",
        "Tên Media": "Video Giới Thiệu Trận Đấu",
        "Đường Dẫn (URL)": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "Loại Media (AUDIO/IMAGE/VIDEO)": "VIDEO"
      },
      {
        "ID": "MEDIA_3",
        "Tên Media": "Poster Vòng Chung Kết",
        "Đường Dẫn (URL)": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200",
        "Loại Media (AUDIO/IMAGE/VIDEO)": "IMAGE"
      }
    ];
    const mediaWs = XLSX.utils.json_to_sheet(mediaSamples);
    XLSX.utils.book_append_sheet(wb, mediaWs, "Media");

    // 6.5 Jeopardy template sheet (Full 30 clues: 6 categories x 5 clues)
    const jpSampleAoa: any[][] = [
      ["Kích Thước Bảng", "5x4"],
      ["CATEGORY", "POINTS", "QUESTION", "ANSWER", "MEDIA LINK", "MEDIA TYPE"],
      // Category 1
      ["LỊCH SỬ VIỆT NAM", 10, "Vị tướng đã chỉ huy Trận Bạch Đằng năm 938 đánh tan quân Nam Hán?", "NGÔ QUYỀN", "", ""],
      ["", 20, "Tên quốc hiệu đầu tiên trong lịch sử nước ta dưới thời Các Vua Hùng?", "VĂN LANG", "", ""],
      ["", 30, "Ai là tác giả của bản \"Hịch tướng sĩ\" nổi tiếng thời nhà Trần?", "TRẦN HƯNG ĐẠO", "", ""],
      ["", 40, "Thủ đô Thăng Long chính thức được Lý Thái Tổ dời về từ đâu vào năm 1010?", "HOA LƯ", "", ""],
      ["", 50, "Vị vua cuối cùng của triều đại phong kiến Việt Nam là ai?", "BẢO ĐẠI", "", ""],
      // Category 2
      ["ĐỊA LÝ & TỰ NHIÊN", 10, "Tỉnh thành nào có diện tích tự nhiên lớn nhất Việt Nam?", "NGHỆ AN", "", ""],
      ["", 20, "Ngọn núi cao nhất Việt Nam và toàn cõi Đông Dương là núi nào?", "FANSIPAN", "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=800", "IMAGE"],
      ["", 30, "Con sông chảy hoàn toàn trên lãnh thổ Việt Nam có chiều dài lớn nhất?", "SÔNG ĐỒNG NAI", "", ""],
      ["", 40, "Thành phố trực thuộc trung ương nào nằm ở khu vực Đồng bằng Sông Cửu Long?", "CẦN THƠ", "", ""],
      ["", 50, "Hồ nước ngọt tự nhiên lớn nhất Việt Nam nằm ở tỉnh Bắc Kạn?", "HỒ BA BỂ", "", ""],
      // Category 3
      ["KHOA HỌC & TỰ NHIÊN", 10, "Hành tinh nào nằm gần Mặt Trời nhất trong Hệ Mặt Trời?", "SAO THỦY", "", ""],
      ["", 20, "Khí nào chiếm tỉ lệ phần trăm thể tích lớn nhất trong không khí quyển Trái Đất?", "NITƠ", "", ""],
      ["", 30, "Bảng tuần hoàn các nguyên tố hóa học do nhà khoa học nào công bố năm 1869?", "MENDELEEV", "", ""],
      ["", 40, "Vận tốc ánh sáng trong chân không xấp xỉ bằng bao nhiêu km/s?", "300.000 KM/S", "", ""],
      ["", 50, "Bào quan trong tế bào nhân thực được gọi là \"nhà máy năng lượng\" của tế bào?", "TY THỂ", "", ""],
      // Category 4
      ["VĂN HỌC & NGHỆ THUẬT", 10, "Tác giả của kiệt tác \"Truyện Kiều\" là danh nhân văn hóa nào?", "NGUYỄN DU", "", ""],
      ["", 20, "Nhà văn là tác giả của tác phẩm thiếu nhi \"Dế Mèn Phiêu Lưu Ký\"?", "TÔ HOÀI", "", ""],
      ["", 30, "Họa sĩ là tác giả của bức tranh sơn dầu nổi tiếng \"Thiếu nữ bên hoa huệ\"?", "TÔ NGỌC VÂN", "", ""],
      ["", 40, "Nhạc sĩ sáng tác ca khúc \"Tiến Quân Ca\" - Quốc ca Việt Nam?", "VĂN CAO", "", ""],
      ["", 50, "Tập thơ \"Nhật ký trong tù\" của Chủ tịch Hồ Chí Minh gồm bao nhiêu bài thơ chữ Hán?", "133 BÀI THƠ", "", ""],
      // Category 5
      ["THỂ THAO & GIẢI TRÍ", 10, "Sân vận động quốc gia nào lớn nhất Việt Nam đặt tại Hà Nội?", "MỸ ĐÌNH", "", ""],
      ["", 20, "Quả bóng Vàng Việt Nam năm 2018 thuộc về cầu thủ nào?", "NGUYỄN QUANG HẢI", "", ""],
      ["", 30, "Thành phố đăng cai Đại hội Thể thao Châu Á (ASIAD) năm 2023?", "HẰNG CHÂU", "", ""],
      ["", 40, "Giải quần vợt Grand Slam duy nhất thi đấu trên mặt sân đất nịch?", "ROLAND GARROS", "", ""],
      ["", 50, "Quốc gia nào là quê hương của Thế vận hội Olympic thời cổ đại?", "HY LẠP", "", ""],
      // Category 6
      ["HIỂU BIẾT CHUNG", 10, "Đơn vị tiền tệ chính thức của Liên minh Châu Âu (EU) là gì?", "EURO", "", ""],
      ["", 20, "Đất nước nào có diện tích lãnh thổ lớn nhất thế giới?", "NGA", "", ""],
      ["", 30, "Ngôn ngữ nào có số lượng người nói bản ngữ đông nhất thế giới?", "TIẾNG TRUNG QUỐC", "", ""],
      ["", 40, "Tòa nhà cao nhất thế giới hiện nay Burj Khalifa nằm ở thành phố nào?", "DUBAI", "", ""],
      ["", 50, "Đại dương nào có diện tích và độ sâu lớn nhất trên Trái Đất?", "THÁI BÌNH DƯƠNG", "", ""]
    ];
    const jpSampleWs = XLSX.utils.aoa_to_sheet(jpSampleAoa);
    jpSampleWs['!cols'] = [
      { wch: 25 },
      { wch: 8 },
      { wch: 65 },
      { wch: 25 },
      { wch: 35 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, jpSampleWs, "Jeopardy");

    // 7. Ma Trận Kép template sheet
    const mtkSamples = [
      { "STT": 1, "Nội Dung Câu Hỏi": "Sông lớn chảy qua Việt Nam", "Đáp Án 1": "SÔNG HỒNG", "Đáp Án 2": "SÔNG MÊ KÔNG", "Đáp Án Nhiễu 1": "SÔNG AMAZON", "Đáp Án Nhiễu 2": "SÔNG ĐỒNG NAI" },
      { "STT": 2, "Nội Dung Câu Hỏi": "Thành phố trực thuộc trung ương ở Việt Nam", "Đáp Án 1": "HÀ NỘI", "Đáp Án 2": "CẦN THƠ", "Đáp Án Nhiễu 1": "BẮC KINH", "Đáp Án Nhiễu 2": "THÀNH PHỐ THÁI NGUYÊN" },
      { "STT": 3, "Nội Dung Câu Hỏi": "Nhà văn Việt Nam đạt giải thưởng Hồ Chí Minh", "Đáp Án 1": "TÔ HOÀI", "Đáp Án 2": "NAM CAO", "Đáp Án Nhiễu 1": "KIM CƯƠNG", "Đáp Án Nhiễu 2": "LÂM ĐỒNG" },
      { "STT": 4, "Nội Dung Câu Hỏi": "Đại dương trên Trái Đất", "Đáp Án 1": "THÁI BÌNH DƯƠNG", "Đáp Án 2": "ẤN ĐỘ DƯƠNG", "Đáp Án Nhiễu 1": "OHM", "Đáp Án Nhiễu 2": "BANGKOK" },
      { "STT": 5, "Nội Dung Câu Hỏi": "Nguyên tố hoá học nhóm khí hiếm", "Đáp Án 1": "HELI", "Đáp Án 2": "NEON", "Đáp Án Nhiễu 1": "PARIS", "Đáp Án Nhiễu 2": "SẮT" },
      { "STT": 6, "Nội Dung Câu Hỏi": "Số nguyên tố nhỏ hơn 10", "Đáp Án 1": "2", "Đáp Án 2": "7", "Đáp Án Nhiễu 1": "CANXI", "Đáp Án Nhiễu 2": "SÔNG NIÊM" },
      { "STT": 7, "Nội Dung Câu Hỏi": "Tỉnh thành thuộc vùng Tây Nguyên", "Đáp Án 1": "LÂM ĐỒNG", "Đáp Án 2": "GIA LAI", "Đáp Án Nhiễu 1": "METAN", "Đáp Án Nhiễu 2": "TOKYO" },
      { "STT": 8, "Nội Dung Câu Hỏi": "Thủ đô các nước Đông Nam Á", "Đáp Án 1": "BANGKOK", "Đáp Án 2": "JAKARTA", "Đáp Án Nhiễu 1": "VÀNG", "Đáp Án Nhiễu 2": "LISSABON" },
      { "STT": 9, "Nội Dung Câu Hỏi": "Nhạc sĩ sáng tác nhạc cách mạng Việt Nam", "Đáp Án 1": "VĂN CAO", "Đáp Án 2": "ĐỖ NHUẬN", "Đáp Án Nhiễu 1": "JOULE", "Đáp Án Nhiễu 2": "AMPE" },
      { "STT": 10, "Nội Dung Câu Hỏi": "Hành tinh trong Hệ Mặt Trời có vành đai", "Đáp Án 1": "THỔ TINH", "Đáp Án 2": "THIÊN VƯƠNG TINH", "Đáp Án Nhiễu 1": "THĂNG LONG", "Đáp Án Nhiễu 2": "BẠCH ĐẰNG" },
      { "STT": 11, "Nội Dung Câu Hỏi": "Cầu thủ bóng đá đạt Quả bóng vàng Việt Nam", "Đáp Án 1": "QUANG HẢI", "Đáp Án 2": "CÔNG PHƯỢNG", "Đáp Án Nhiễu 1": "VẠN XUÂN", "Đáp Án Nhiễu 2": "ĐẠI VIỆT" },
      { "STT": 12, "Nội Dung Câu Hỏi": "Bào quan có trong tế bào thực vật", "Đáp Án 1": "LỤC THỂ", "Đáp Án 2": "TY THỂ", "Đáp Án Nhiễu 1": "NEWTON", "Đáp Án Nhiễu 2": "WATT" }
    ];
    const mtkWs = XLSX.utils.json_to_sheet(mtkSamples);
    mtkWs['!cols'] = [
      { wch: 8 },
      { wch: 50 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 }
    ];
    XLSX.utils.book_append_sheet(wb, mtkWs, "Ma Trận Kép");

    // 7.1 Chinh Phục & GMĐT template sheet (Gom chung: GMDT ở trên cùng, 90 câu Chinh Phục ở dưới)
    const cpTemplateRows: any[][] = [
      ["=== MINIGAME GIẢI MÃ ĐIỆN THOẠI (GMĐT) ==="],
      ["", "", "Gợi Ý GMĐT", "Đáp Án Cuối GMĐT"],
      ["", "", "Sân chơi trí tuệ học đường cấp Quốc gia", "Olympia"],
      [],
      ["=== CÂU HỎI CHINH PHỤC (90 CÂU: 30 DỄ, 30 TRUNG BÌNH, 30 KHÓ) ==="],
      ["STT", "Mức Điểm", "Nội Dung Câu Hỏi", "Đáp Án Đúng", "Chú Thích", "Đường Dẫn Media (URL)", "Loại Media (image/audio/video)"]
    ];

    let tStt = 1;
    // 30 câu Dễ (10đ)
    for (let i = 1; i <= 30; i++) {
      if (i === 1) {
        cpTemplateRows.push([tStt++, 10, "Sông nào chảy qua thành phố Hà Nội?", "SÔNG HỒNG", "Con sông lớn nhất miền Bắc.", "", "image"]);
      } else {
        cpTemplateRows.push([tStt++, 10, "", "", "", "", "image"]);
      }
    }

    // 30 câu Trung Bình (20đ)
    for (let i = 1; i <= 30; i++) {
      if (i === 1) {
        cpTemplateRows.push([tStt++, 20, "Thành phố nào là trung tâm kinh tế phía Nam Việt Nam?", "THÀNH PHỐ HỒ CHÍ MINH", "Tên cũ là Sài Gòn.", "", "image"]);
      } else {
        cpTemplateRows.push([tStt++, 20, "", "", "", "", "image"]);
      }
    }

    // 30 câu Khó (30đ)
    for (let i = 1; i <= 30; i++) {
      if (i === 1) {
        cpTemplateRows.push([tStt++, 30, "Tỉnh nào giáp cả Lào và Campuchia ở Việt Nam?", "KON TUM", "Ngã ba Đông Dương.", "", "image"]);
      } else {
        cpTemplateRows.push([tStt++, 30, "", "", "", "", "image"]);
      }
    }

    const cpWsTemplate = XLSX.utils.aoa_to_sheet(cpTemplateRows);
    cpWsTemplate['!cols'] = [
      { wch: 8 },
      { wch: 12 },
      { wch: 50 },
      { wch: 25 },
      { wch: 30 },
      { wch: 30 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, cpWsTemplate, "Chinh Phục");

    // 7.8 Đấu Trí template sheet (25 câu hỏi chính + 25 gói câu hỏi thưởng)
    const dauTriSamples = [
      {
        "STT": 1,
        "Câu Hỏi Chính": "Đại dương nào có diện tích và độ sâu trung bình lớn nhất trên Trái Đất?",
        "Đáp Án Câu Chính": "THÁI BÌNH DƯƠNG",
        "Giải Thích Câu Chính": "Chiếm hơn 1/3 diện tích bề mặt Trái Đất.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Địa lý & Đại dương",
        "Câu Thưởng 1": "Điểm sâu nhất của rãnh Mariana nằm ở đại dương nào?",
        "Đáp Án Thưởng 1": "THÁI BÌNH DƯƠNG",
        "Giải Thích Thưởng 1": "Vực thẳm Challenger sâu gần 11.000m.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Đại dương nào nhỏ nhất và có nhiệt độ bề mặt lạnh nhất?",
        "Đáp Án Thưởng 2": "BẮC BĂNG DƯƠNG",
        "Giải Thích Thưởng 2": "Nằm hoàn toàn ở vùng cực Bắc.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Biển Baltic thông trực tiếp với đại dương nào?",
        "Đáp Án Thưởng 3": "ĐẠI TÂY DƯƠNG",
        "Giải Thích Thưởng 3": "Thông qua các eo biển Đan Mạch.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 2,
        "Câu Hỏi Chính": "Số nguyên tố chẵn duy nhất trong tập hợp các số tự nhiên là số nào?",
        "Đáp Án Câu Chính": "2",
        "Giải Thích Câu Chính": "Mọi số chẵn lớn hơn 2 đều chia hết cho 2 nên là hợp số.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Toán học & Số học",
        "Câu Thưởng 1": "Số nguyên tố nhỏ nhất có 2 chữ số là số nào?",
        "Đáp Án Thưởng 1": "11",
        "Giải Thích Thưởng 1": "Các số nhỏ hơn: 10 chia hết cho 2 và 5.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Có bao nhiêu số nguyên tố nhỏ hơn 20?",
        "Đáp Án Thưởng 2": "8",
        "Giải Thích Thưởng 2": "Gồm 2, 3, 5, 7, 11, 13, 17, 19.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Tổng của ba số nguyên tố đầu tiên bằng bao nhiêu?",
        "Đáp Án Thưởng 3": "10",
        "Giải Thích Thưởng 3": "2 + 3 + 5 = 10.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 3,
        "Câu Hỏi Chính": "Chiến dịch Điện Biên Phủ toàn thắng vào ngày tháng năm nào?",
        "Đáp Án Câu Chính": "07/05/1954",
        "Giải Thích Câu Chính": "Lừng lẫy năm châu, chấn động địa cầu.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Lịch sử Việt Nam thế kỷ XX",
        "Câu Thưởng 1": "Ai là Tổng tư lệnh trực tiếp chỉ huy chiến dịch Điện Biên Phủ?",
        "Đáp Án Thưởng 1": "VÕ NGUYÊN GIÁP",
        "Giải Thích Thưởng 1": "Đại tướng Võ Nguyên Giáp.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Chiến dịch Điện Biên Phủ diễn ra trong bao nhiêu ngày đêm?",
        "Đáp Án Thưởng 2": "56",
        "Giải Thích Thưởng 2": "56 ngày đêm khoét núi, ngủ hầm, mưa dầm, cơm vắt.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Tên tướng chỉ huy tập đoàn cứ điểm Điện Biên Phủ bị bắt sống?",
        "Đáp Án Thưởng 3": "ĐỜ CÁT",
        "Giải Thích Thưởng 3": "Tướng Christian de Castries.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 4,
        "Câu Hỏi Chính": "Kim loại nào có ký hiệu hóa học là 'Au' trong bảng tuần hoàn Mendeleev?",
        "Đáp Án Câu Chính": "VÀNG",
        "Giải Thích Câu Chính": "Xuất phát từ tiếng Latinh Aurum.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Hóa học & Kim loại",
        "Câu Thưởng 1": "Kim loại nào có tính dẫn điện và dẫn nhiệt tốt nhất ở điều kiện thường?",
        "Đáp Án Thưởng 1": "BẠC",
        "Giải Thích Thưởng 1": "Thứ tự dẫn điện: Ag > Cu > Au > Al > Fe.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Kim loại duy nhất ở thể lỏng ở nhiệt độ phòng là gì?",
        "Đáp Án Thưởng 2": "THỦY NGÂN",
        "Giải Thích Thưởng 2": "Ký hiệu Hg, nhiệt độ nóng chảy -38.83°C.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Kim loại nào có nhiệt độ nóng chảy cao nhất (~3422°C)?",
        "Đáp Án Thưởng 3": "VONFRAM",
        "Giải Thích Thưởng 3": "Dùng làm dây tóc bóng đèn sợi đốt.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 5,
        "Câu Hỏi Chính": "Tác phẩm 'Truyện Kiều' bất hủ do đại thi hào nào sáng tác?",
        "Đáp Án Câu Chính": "NGUYỄN DU",
        "Giải Thích Câu Chính": "Tên chữ Tố Như, hiệu Thanh Hiên.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Văn học Trung đại Việt Nam",
        "Câu Thưởng 1": "Truyện Kiều được viết theo thể thơ truyền thống nào của dân tộc?",
        "Đáp Án Thưởng 1": "LỤC BÁT",
        "Giải Thích Thưởng 1": "Gồm 3.254 câu thơ lục bát.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Tên họ đầy đủ của nhân vật Thúy Kiều trong tác phẩm là gì?",
        "Đáp Án Thưởng 2": "VƯƠNG THÚY KIỀU",
        "Giải Thích Thưởng 2": "Gia đình họ Vương.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Mối tình đầu tha thiết của Thúy Kiều là chàng thư sinh nào?",
        "Đáp Án Thưởng 3": "KIM TRỌNG",
        "Giải Thích Thưởng 3": "Vào tiết Thanh minh.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 6,
        "Câu Hỏi Chính": "Hành tinh nào gần Mặt Trời nhất trong Hệ Mặt Trời?",
        "Đáp Án Câu Chính": "THỦY TINH",
        "Giải Thích Câu Chính": "Mercury - hành tinh nhỏ nhất và gần Mặt Trời nhất.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Thiên văn & Vũ trụ",
        "Câu Thưởng 1": "Hành tinh nào có nhiệt độ bề mặt trung bình nóng nhất Hệ Mặt Trời?",
        "Đáp Án Thưởng 1": "KIM TINH",
        "Giải Thích Thưởng 1": "Sao Kim do hiệu ứng nhà kính dày đặc.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Hành tinh nào lớn nhất trong Hệ Mặt Trời?",
        "Đáp Án Thưởng 2": "MỘC TINH",
        "Giải Thích Thưởng 2": "Sao Mộc (Jupiter) là hành tinh khí khổng lồ.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Vệ tinh tự nhiên duy nhất của Trái Đất là gì?",
        "Đáp Án Thưởng 3": "MẶT TRĂNG",
        "Giải Thích Thưởng 3": "Khoảng cách trung bình 384.400 km.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 7,
        "Câu Hỏi Chính": "Khí nào chiếm thể tích lớn nhất trong bầu khí quyển Trái Đất (~78%)?",
        "Đáp Án Câu Chính": "NITƠ",
        "Giải Thích Câu Chính": "Khí Nitrogen (N2).",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Khí quyển & Môi trường",
        "Câu Thưởng 1": "Khí Oxi chiếm khoảng bao nhiêu phần trăm thể tích khí quyển?",
        "Đáp Án Thưởng 1": "21%",
        "Giải Thích Thưởng 1": "Khoảng 20.95% thể tích.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Tầng khí quyển nào chứa tầng Ozon hấp thụ tia cực tím?",
        "Đáp Án Thưởng 2": "BÌNH LƯU",
        "Giải Thích Thưởng 2": "Tầng bình lưu (Stratosphere).",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Công thức phân tử của khí Ozon là gì?",
        "Đáp Án Thưởng 3": "O3",
        "Giải Thích Thưởng 3": "Gồm 3 nguyên tử oxi liên kết.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 8,
        "Câu Hỏi Chính": "Nhạc sĩ nào sáng tác ca khúc 'Tiến quân ca' - Quốc ca của nước CHXHCN Việt Nam?",
        "Đáp Án Câu Chính": "VĂN CAO",
        "Giải Thích Câu Chính": "Sáng tác vào năm 1944.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Âm nhạc & Nhạc sĩ Việt Nam",
        "Câu Thưởng 1": "Ca khúc 'Hò kéo pháo' của nhạc sĩ Hoàng Vân gắn liền với chiến dịch nào?",
        "Đáp Án Thưởng 1": "ĐIỆN BIÊN PHỦ",
        "Giải Thích Thưởng 1": "Ra đời trong chiến dịch năm 1954.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Nhạc sĩ nào được mệnh danh là người viết tình ca hay nhất thế kỷ với các bài 'Hạ trắng', 'Diễm xưa'?",
        "Đáp Án Thưởng 2": "TRỊNH CÔNG SƠN",
        "Giải Thích Thưởng 2": "Nhạc sĩ Trịnh Công Sơn.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Bài hát chính thức của Đoàn TNCS Hồ Chí Minh là 'Thanh niên làm theo lời Bác' của ai?",
        "Đáp Án Thưởng 3": "HOÀNG HÀ",
        "Giải Thích Thưởng 3": "Nhạc sĩ Hoàng Hà sáng tác năm 1953.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 9,
        "Câu Hỏi Chính": "Cầu thủ bóng đá nào giữ kỷ lục đoạt nhiều Quả bóng Vàng thế giới (Ballon d'Or) nhất lịch sử?",
        "Đáp Án Câu Chính": "LIONEL MESSI",
        "Giải Thích Câu Chính": "Đã giành 8 Quả bóng Vàng (tính đến 2023).",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Bóng đá Thế giới",
        "Câu Thưởng 1": "Đội tuyển quốc gia nào vô địch FIFA World Cup nhiều lần nhất (5 lần)?",
        "Đáp Án Thưởng 1": "BRAZIL",
        "Giải Thích Thưởng 1": "Vô địch các năm 1958, 1962, 1970, 1994, 2002.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "World Cup bóng đá nam được tổ chức định kỳ mấy năm một lần?",
        "Đáp Án Thưởng 2": "4",
        "Giải Thích Thưởng 2": "4 năm một lần.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Cầu thủ nào ghi nhiều bàn thắng nhất lịch sử vòng chung kết World Cup (16 bàn)?",
        "Đáp Án Thưởng 3": "MIROSLAV KLOSE",
        "Giải Thích Thưởng 3": "Tiền đạo người Đức.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 10,
        "Câu Hỏi Chính": "Đỉnh núi nào được mệnh danh là 'Nóc nhà Đông Dương' với độ cao 3.143m?",
        "Đáp Án Câu Chính": "FANSIPAN",
        "Giải Thích Câu Chính": "Thuộc dãy Hoàng Liên Sơn, tỉnh Lào Cai.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Địa lý Việt Nam",
        "Câu Thưởng 1": "Dãy núi nào đóng vai trò ranh giới tự nhiên giữa miền khí hậu Bắc và Nam Việt Nam?",
        "Đáp Án Thưởng 1": "BẠCH MÃ",
        "Giải Thích Thưởng 1": "Dãy Bạch Mã với đèo Hải Vân.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Vịnh biển nào của Việt Nam 2 lần được UNESCO công nhận là Di sản thiên nhiên thế giới?",
        "Đáp Án Thưởng 2": "VỊNH HẠ LONG",
        "Giải Thích Thưởng 2": "Thuộc tỉnh Quảng Ninh.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Hồ nước ngọt tự nhiên lớn nhất Việt Nam nằm ở tỉnh Bắc Kạn có tên là gì?",
        "Đáp Án Thưởng 3": "HỒ BA BỂ",
        "Giải Thích Thưởng 3": "Nằm trong Vườn quốc gia Ba Bể.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 11,
        "Câu Hỏi Chính": "Cơ quan nào trong cơ thể người chịu trách nhiệm bơm máu nuôi toàn bộ cơ thể?",
        "Đáp Án Câu Chính": "TIM",
        "Giải Thích Câu Chính": "Trái tim hoạt động như máy bơm tuần hoàn.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Giải phẫu & Sinh học Người",
        "Câu Thưởng 1": "Tế bào máu nào đảm nhận chức năng vận chuyển oxy đi khắp cơ thể?",
        "Đáp Án Thưởng 1": "HỒNG CẦU",
        "Giải Thích Thưởng 1": "Chứa huyết sắc tố Hemoglobin.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Bộ phận nào có diện tích bề mặt lớn nhất trên cơ thể con người?",
        "Đáp Án Thưởng 2": "DA",
        "Giải Thích Thưởng 2": "Diện tích khoảng 1.5 - 2 m² ở người trưởng thành.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Xương nào dài nhất và chắc khỏe nhất trong cơ thể người?",
        "Đáp Án Thưởng 3": "XƯƠNG ĐÙI",
        "Giải Thích Thưởng 3": "Nằm ở phần chi dưới.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 12,
        "Câu Hỏi Chính": "Đơn vị đo cường độ dòng điện trong hệ đo lường quốc tế SI là gì?",
        "Đáp Án Câu Chính": "AMPE",
        "Giải Thích Câu Chính": "Ký hiệu A, đặt theo tên nhà vật lý André-Marie Ampère.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Vật lý & Điện học",
        "Câu Thưởng 1": "Định luật I = U / R mang tên nhà bác học nào?",
        "Đáp Án Thưởng 1": "OHM",
        "Giải Thích Thưởng 1": "Định luật Ôm cho đoạn mạch.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Đơn vị đo điện thế và hiệu điện thế là gì?",
        "Đáp Án Thưởng 2": "VÔN",
        "Giải Thích Thưởng 2": "Ký hiệu V (Volt).",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Dụng cụ dùng để đo cường độ dòng điện gọi là gì?",
        "Đáp Án Thưởng 3": "AMPE KẾ",
        "Giải Thích Thưởng 3": "Mắc nối tiếp trong mạch điện.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 13,
        "Câu Hỏi Chính": "Ai là vị vua đầu tiên lập nên triều đại nhà Lý vào năm 1009?",
        "Đáp Án Câu Chính": "LÝ THÁI TỔ",
        "Giải Thích Câu Chính": "Lý Công Uẩn dời đô về Thăng Long năm 1010.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Triều đại Phong kiến Việt Nam",
        "Câu Thưởng 1": "Tên văn bản nổi tiếng của Lý Công Uẩn khi dời đô từ Hoa Lư về Đại La?",
        "Đáp Án Thưởng 1": "CHIẾU DỜI ĐÔ",
        "Giải Thích Thưởng 1": "Thiên đô chiếu.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Triều đại phong kiến cuối cùng trong lịch sử Việt Nam là triều đại nào?",
        "Đáp Án Thưởng 2": "NHÀ NGUYỄN",
        "Giải Thích Thưởng 2": "Từ 1802 đến 1945 (Vua Bảo Đại thoái vị).",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Ai là tác giả của áng thiên cổ hùng văn 'Bình Ngô Đại Cáo'?",
        "Đáp Án Thưởng 3": "NGUYỄN TRÃI",
        "Giải Thích Thưởng 3": "Viết năm 1428 sau chiến thắng khởi nghĩa Lam Sơn.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 14,
        "Câu Hỏi Chính": "Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là thành phố nào?",
        "Đáp Án Câu Chính": "HÀ NỘI",
        "Giải Thích Câu Chính": "Trung tâm chính trị, văn hóa của cả nước.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Đô thị & Thủ đô Thế giới",
        "Câu Thưởng 1": "Thủ đô của Vương quốc Thái Lan là thành phố nào?",
        "Đáp Án Thưởng 1": "BANGKOK",
        "Giải Thích Thưởng 1": "Còn gọi là Krung Thep Maha Nakhon.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Thành phố nào là thủ đô của nước Pháp?",
        "Đáp Án Thưởng 2": "PARIS",
        "Giải Thích Thưởng 2": "Kinh đô ánh sáng.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Thủ đô của Australia là thành phố nào?",
        "Đáp Án Thưởng 3": "CANBERRA",
        "Giải Thích Thưởng 3": "Không phải Sydney hay Melbourne.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 15,
        "Câu Hỏi Chính": "Nhà khoa học nào phát hiện ra Định luật Vạn vật hấp dẫn nhờ quả táo rơi?",
        "Đáp Án Câu Chính": "ISAAC NEWTON",
        "Giải Thích Câu Chính": "Sir Isaac Newton (1643 - 1727).",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Nhà bác học & Phát minh",
        "Câu Thưởng 1": "Ai là nhà bác học phát triển Thuyết tương đối hẹp và Thuyết tương đối rộng?",
        "Đáp Án Thưởng 1": "ALBERT EINSTEIN",
        "Giải Thích Thưởng 1": "Công thức E = mc² nổi tiếng.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Ai phát minh ra bóng đèn dây tóc thương mại và máy ghi âm?",
        "Đáp Án Thưởng 2": "THOMAS EDISON",
        "Giải Thích Thưởng 2": "Nhà phát minh vĩ đại người Mỹ.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Nhà nữ khoa học đầu tiên nhận hai giải Nobel ở hai lĩnh vực Vật lý và Hóa học?",
        "Đáp Án Thưởng 3": "MARIE CURIE",
        "Giải Thích Thưởng 3": "Marie Curie cùng nghiên cứu về phóng xạ.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 16,
        "Câu Hỏi Chính": "Đơn vị tiền tệ chính thức của nước Nhật Bản là gì?",
        "Đáp Án Câu Chính": "YÊN",
        "Giải Thích Câu Chính": "Ký hiệu JPY (¥).",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Kinh tế & Tiền tệ Quốc tế",
        "Câu Thưởng 1": "Đồng tiền chung của Liên minh Châu Âu (EU) có tên là gì?",
        "Đáp Án Thưởng 1": "EURO",
        "Giải Thích Thưởng 1": "Ký hiệu €.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Đơn vị tiền tệ của Vương quốc Anh là gì?",
        "Đáp Án Thưởng 2": "BẢNG ANH",
        "Giải Thích Thưởng 2": "Ký hiệu GBP (£).",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Đơn vị tiền tệ chính thức của Hàn Quốc là gì?",
        "Đáp Án Thưởng 3": "WON",
        "Giải Thích Thưởng 3": "Ký hiệu KRW (₩).",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 17,
        "Câu Hỏi Chính": "Chất diệp lục trong tế bào thực vật có màu gì?",
        "Đáp Án Câu Chính": "XANH LÁ CÂY",
        "Giải Thích Câu Chính": "Chlorophyll hấp thụ ánh sáng đỏ và xanh lam, phản chiếu xanh lục.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Thực vật học & Sinh thái",
        "Câu Thưởng 1": "Quá trình thực vật tổng hợp chất hữu cơ từ CO2 và nước nhờ ánh sáng gọi là gì?",
        "Đáp Án Thưởng 1": "QUANG HỢP",
        "Giải Thích Thưởng 1": "Giải phóng khí oxi vào môi trường.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Bào quan nào trong tế bào thực vật trực tiếp thực hiện quang hợp?",
        "Đáp Án Thưởng 2": "LỤC LẠP",
        "Giải Thích Thưởng 2": "Chứa hạt grana và chất nền stroma.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Khí nào được thực vật hấp thụ nhiều nhất trong quá trình quang hợp?",
        "Đáp Án Thưởng 3": "CACBONIC",
        "Giải Thích Thưởng 3": "Khí CO2 (Cacbon dioxit).",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 18,
        "Câu Hỏi Chính": "Thế vận hội Olympic mùa hè hiện đại đầu tiên được tổ chức tại quốc gia nào vào năm 1896?",
        "Đáp Án Câu Chính": "HY LẠP",
        "Giải Thích Câu Chính": "Tổ chức tại thành phố Athens.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Thể thao & Olympic",
        "Câu Thưởng 1": "Biểu tượng của Thế vận hội Olympic gồm bao nhiêu vòng tròn đan vào nhau?",
        "Đáp Án Thưởng 1": "5",
        "Giải Thích Thưởng 1": "Tượng trưng cho 5 châu lục.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Vận động viên điền kinh Usain Bolt mang quốc tịch của quốc gia nào?",
        "Đáp Án Thưởng 2": "JAMAICA",
        "Giải Thích Thưởng 2": "Huyền thoại chạy cự ly ngắn.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Cự ly tiêu chuẩn của một chặng đua Marathon là bao nhiêu km?",
        "Đáp Án Thưởng 3": "42.195 KM",
        "Giải Thích Thưởng 3": "42 km 195 m.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 19,
        "Câu Hỏi Chính": "Cây cầu dây văng đầu tiên bắc qua sông Tiền ở miền Tây Nam Bộ có tên là gì?",
        "Đáp Án Câu Chính": "CẦU MỸ THUẬN",
        "Giải Thích Câu Chính": "Khánh thành vào năm 2000, nối Tiền Giang và Vĩnh Long.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Giao thông & Công trình Việt Nam",
        "Câu Thưởng 1": "Cây cầu xoay duy nhất ở Việt Nam bắc qua sông Hàn nằm ở thành phố nào?",
        "Đáp Án Thưởng 1": "ĐÀ NẴNG",
        "Giải Thích Thưởng 1": "Cầu sông Hàn.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Cây cầu biểu tượng nối liền hai bờ sông Hương ở Huế có tên là gì?",
        "Đáp Án Thưởng 2": "CẦU TRÀNG TIỀN",
        "Giải Thích Thưởng 2": "Do kiến trúc sư Gustave Eiffel thiết kế thời Pháp thuộc.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Cây cầu vượt biển dài nhất Việt Nam khánh thành năm 2017 nằm ở Hải Phòng là cầu nào?",
        "Đáp Án Thưởng 3": "CẦU TÂN VŨ - LẠCH HUYỆN",
        "Giải Thích Thưởng 3": "Cầu Tân Vũ - Lạch Huyện dài hơn 5,4 km.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 20,
        "Câu Hỏi Chính": "Bức tranh nàng Mona Lisa nổi tiếng thế giới do danh họa nào vẽ?",
        "Đáp Án Câu Chính": "LEONARDO DA VINCI",
        "Giải Thích Câu Chính": "Danh họa thời kỳ Phục hưng người Ý.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Mỹ thuật & Hội họa Thế giới",
        "Câu Thưởng 1": "Bảo tàng Louvre - nơi trưng bày bức họa Mona Lisa nằm ở thành phố nào?",
        "Đáp Án Thưởng 1": "PARIS",
        "Giải Thích Thưởng 1": "Bảo tàng nghệ thuật lớn nhất thế giới tại Pháp.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Họa sĩ Vincent van Gogh là tác giả của bức tranh sơn dầu nổi tiếng nào?",
        "Đáp Án Thưởng 2": "ĐÊM ĐẦY SAO",
        "Giải Thích Thưởng 2": "The Starry Night.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Bức tranh sơn dầu 'Thiếu nữ bên hoa huệ' là tác phẩm của họa sĩ Việt Nam nào?",
        "Đáp Án Thưởng 3": "TÔ NGỌC VÂN",
        "Giải Thích Thưởng 3": "Vẽ năm 1943.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 21,
        "Câu Hỏi Chính": "Hệ điều hành mã nguồn mở nhân Linux phổ biến nhất trên điện thoại thông minh hiện nay là gì?",
        "Đáp Án Câu Chính": "ANDROID",
        "Giải Thích Câu Chính": "Do tập đoàn Google phát triển.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Công nghệ Thông tin & Phần mềm",
        "Câu Thưởng 1": "Ngôn ngữ đánh dấu siêu văn bản dùng để xây dựng trang web có tên viết tắt là gì?",
        "Đáp Án Thưởng 1": "HTML",
        "Giải Thích Thưởng 1": "HyperText Markup Language.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Công ty nào sáng lập ra hệ điều hành Windows và bộ ứng dụng Office?",
        "Đáp Án Thưởng 2": "MICROSOFT",
        "Giải Thích Thưởng 2": "Thành lập bởi Bill Gates và Paul Allen.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Giao thức bảo mật truyền tải siêu văn bản có biểu tượng ổ khóa màu xanh trên trình duyệt viết tắt là gì?",
        "Đáp Án Thưởng 3": "HTTPS",
        "Giải Thích Thưởng 3": "Hypertext Transfer Protocol Secure.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 22,
        "Câu Hỏi Chính": "Vùng đồng bằng nào là vựa lúa lớn nhất của cả nước Việt Nam?",
        "Đáp Án Câu Chính": "ĐỒNG BẰNG SÔNG CỬU LONG",
        "Giải Thích Câu Chính": "Đóng góp trên 50% sản lượng lúa và 90% lượng gạo xuất khẩu cả nước.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Nông nghiệp & Địa lý Kinh tế",
        "Câu Thưởng 1": "Việt Nam là một trong những quốc gia xuất khẩu mặt hàng nông sản hạt nào đứng đầu thế giới?",
        "Đáp Án Thưởng 1": "CÀ PHÊ",
        "Giải Thích Thưởng 1": "Đứng đầu thế giới về xuất khẩu cà phê Robusta.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Vùng chuyên canh cây cao su và chè lớn nhất miền Bắc Việt Nam là vùng nào?",
        "Đáp Án Thưởng 2": "TRUNG DU VÀ MIỀN NÚI BẮC BỘ",
        "Giải Thích Thưởng 2": "Đặc biệt là chè Thái Nguyên, Mộc Châu.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Tỉnh nào ở Tây Nguyên được mệnh danh là thủ phủ cà phê của Việt Nam?",
        "Đáp Án Thưởng 3": "ĐẮK LẮK",
        "Giải Thích Thưởng 3": "Với thương hiệu Cà phê Buôn Ma Thuột.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 23,
        "Câu Hỏi Chính": "Ai là tác giả của tập thơ 'Nhật ký trong tù' gồm 133 bài thơ chữ Hán?",
        "Đáp Án Câu Chính": "HỒ CHÍ MINH",
        "Giải Thích Câu Chính": "Viết trong thời gian bị chính quyền Tưởng Giới Thạch giam giữ 1942 - 1943.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Văn thơ Cách mạng Việt Nam",
        "Câu Thưởng 1": "Bài thơ 'Viếng lăng Bác' là sáng tác nổi tiếng của nhà thơ nào?",
        "Đáp Án Thưởng 1": "VIỄN PHƯƠNG",
        "Giải Thích Thưởng 1": "Viết năm 1976 khi lăng Chủ tịch Hồ Chí Minh khánh thành.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Tập thơ 'Từ ấy' và 'Gió lộng' là của nhà thơ cách mạng tiêu biểu nào?",
        "Đáp Án Thưởng 2": "TỐ HỮU",
        "Giải Thích Thưởng 2": "Nhà thơ lớn của thơ ca cách mạng Việt Nam.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Bài thơ 'Đồng chí' ngợi ca tình đồng đội của anh bộ đội Cụ Hồ do ai sáng tác?",
        "Đáp Án Thưởng 3": "CHÍNH HỮU",
        "Giải Thích Thưởng 3": "Sáng tác đầu năm 1948 tại chiến khu Việt Bắc.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 24,
        "Câu Hỏi Chính": "Động vật có vú nào bay được duy nhất trong thế giới động vật?",
        "Đáp Án Câu Chính": "DƠI",
        "Giải Thích Câu Chính": "Bộ Dơi (Chiroptera) với màng cánh nối các ngón tay.",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Thế giới Động vật Hoang dã",
        "Câu Thưởng 1": "Loài thú ăn thịt trên cạn chạy nhanh nhất thế giới là loài nào?",
        "Đáp Án Thưởng 1": "BÁO SĂN",
        "Giải Thích Thưởng 1": "Báo Cheetah có thể đạt tốc độ 100 - 120 km/h.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Loài chim lớn nhất thế giới còn sống nhưng không biết bay là chim gì?",
        "Đáp Án Thưởng 2": "ĐÀ ĐIỂU",
        "Giải Thích Thưởng 2": "Đà điểu châu Phi.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Động vật lớn nhất từng tồn tại trên Trái Đất còn sống ở đại dương là gì?",
        "Đáp Án Thưởng 3": "CÁ VOI XANH",
        "Giải Thích Thưởng 3": "Có thể dài trên 30m và nặng gần 200 tấn.",
        "Media Thưởng 3 (URL)": ""
      },
      {
        "STT": 25,
        "Câu Hỏi Chính": "Chương trình truyền hình 'Đường lên đỉnh Olympia' do Ban Sản xuất các chương trình Giải trí của đài truyền hình nào sản xuất?",
        "Đáp Án Câu Chính": "VTV",
        "Giải Thích Câu Chính": "Đài Truyền hình Việt Nam (phát sóng lần đầu năm 1999).",
        "Media Câu Chính (URL)": "",
        "Loại Media Câu Chính": "image",
        "Chủ Đề Gói Thưởng": "Đường lên đỉnh Olympia",
        "Câu Thưởng 1": "Quán quân Đường lên đỉnh Olympia đầu tiên (năm thứ 1) là ai?",
        "Đáp Án Thưởng 1": "TRẦN NGỌC MINH",
        "Giải Thích Thưởng 1": "Học sinh trường THPT Chuyên Nguyễn Huệ, Hà Nội.",
        "Media Thưởng 1 (URL)": "",
        "Câu Thưởng 2": "Phần thưởng danh giá trao cho quán quân trong trận Chung kết năm là chiếc vòng gì?",
        "Đáp Án Thưởng 2": "VÒNG NGUYỆT QUẾ",
        "Giải Thích Thưởng 2": "Biểu tượng vinh quang chiến thắng.",
        "Media Thưởng 2 (URL)": "",
        "Câu Thưởng 3": "Tên linh vật truyền thống của chương trình Đường lên đỉnh Olympia?",
        "Đáp Án Thưởng 3": "CẬU BÉ OLYMPIA",
        "Giải Thích Thưởng 3": "Hình ảnh đại diện quen thuộc của chương trình.",
        "Media Thưởng 3 (URL)": ""
      }
    ];

    const dauTriMainSamples = dauTriSamples.map((s, idx) => ({
      "STT": s["STT"] || (idx + 1),
      "Nội Dung Câu Hỏi Chính": s["Câu Hỏi Chính"] || "",
      "Đáp Án Câu Chính": s["Đáp Án Câu Chính"] || "",
      "Giải Thích Câu Chính": s["Giải Thích Câu Chính"] || "",
      "Media Câu Chính (URL)": s["Media Câu Chính (URL)"] || "",
      "Loại Media Câu Chính": s["Loại Media Câu Chính"] || "image"
    }));
    const dtWsTemplate = XLSX.utils.json_to_sheet(dauTriMainSamples);
    dtWsTemplate['!cols'] = [
      { wch: 6 },
      { wch: 50 },
      { wch: 25 },
      { wch: 30 },
      { wch: 30 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, dtWsTemplate, "Đấu Trí");

    // 7.9 Đấu trí_Câu thưởng template sheet (Layout dọc từng dòng liên tục, STT và Chủ đề chỉ hiển thị 1 lần mỗi gói)
    const dauTriBonusSamples: any[] = [];
    dauTriSamples.forEach((s: any, idx: number) => {
      const packId = s["STT"] || (idx + 1);
      const theme = s["Chủ Đề Gói Thưởng"] || `Chủ đề thưởng ${idx + 1}`;
      [1, 2, 3].forEach((bNum, bIdx) => {
        dauTriBonusSamples.push({
          "Gói STT": bIdx === 0 ? packId : "",
          "Chủ Đề Gói Thưởng": bIdx === 0 ? theme : "",
          "Câu Thưởng Số": bNum,
          "Nội Dung Câu Hỏi Thưởng": s[`Câu Thưởng ${bNum}`] || "",
          "Đáp Án Thưởng": s[`Đáp Án Thưởng ${bNum}`] || "",
          "Giải Thích Thưởng": s[`Giải Thích Thưởng ${bNum}`] || "",
          "Media Thưởng (URL)": s[`Media Thưởng ${bNum} (URL)`] || "",
          "Loại Media Thưởng": "image"
        });
      });
    });
    const dtBonusWsTemplate = XLSX.utils.json_to_sheet(dauTriBonusSamples);
    dtBonusWsTemplate['!cols'] = [
      { wch: 10 },
      { wch: 30 },
      { wch: 14 },
      { wch: 50 },
      { wch: 25 },
      { wch: 30 },
      { wch: 30 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, dtBonusWsTemplate, "Đấu trí_Câu thưởng");

    // 8. Cài đặt template sheet
    const settingsSamples = [
      { "Phần / Vòng Thi": "Khởi Động", "Mã Vòng": "KHOI_DONG", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật Khởi Động khi nạp file, 0 để giữ nguyên" },
      { "Phần / Vòng Thi": "Vượt Chướng Ngại Vật", "Mã Vòng": "VCNV", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật VCNV khi nạp file, 0 để giữ nguyên" },
      { "Phần / Vòng Thi": "Tăng Tốc", "Mã Vòng": "TANG_TOC", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật Tăng Tốc khi nạp file, 0 để giữ nguyên" },
      { "Phần / Vòng Thi": "Về Đích", "Mã Vòng": "VE_DICH", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật Về Đích khi nạp file, 0 để giữ nguyên" },
      { "Phần / Vòng Thi": "Câu Hỏi Phụ", "Mã Vòng": "CH_PHU", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật Câu Hỏi Phụ khi nạp file, 0 để giữ nguyên" },
      { "Phần / Vòng Thi": "Media Ngoài", "Mã Vòng": "MEDIA", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật danh sách Media ngoài khi nạp file, 0 để giữ nguyên" },
      { "Phần / Vòng Thi": "Jeopardy!", "Mã Vòng": "JEOPARDY", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật Jeopardy! khi nạp file, 0 để giữ nguyên (Nhận diện 5x4 hoặc 6x5 theo B1)" },
      { "Phần / Vòng Thi": "Ma Trận Kép", "Mã Vòng": "MA_TRAN_KEP", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật Ma Trận Kép khi nạp file, 0 để giữ nguyên" },
      { "Phần / Vòng Thi": "Chinh Phục & GMĐT", "Mã Vòng": "CHINH_PHUC", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật Chinh Phục & GMĐT khi nạp file, 0 để giữ nguyên" },
      { "Phần / Vòng Thi": "Đấu Trí", "Mã Vòng": "DAU_TRI", "Upload (1: Có, 0: Không)": 1, "Ghi Chú": "Nhập 1 để cập nhật Đấu Trí & Đấu trí_Câu thưởng khi nạp file, 0 để giữ nguyên (25 câu hỏi chính + 25 gói câu hỏi thưởng)" }
    ];
    const settingsWs = XLSX.utils.json_to_sheet(settingsSamples);
    XLSX.utils.book_append_sheet(wb, settingsWs, "Cài đặt");

    XLSX.writeFile(wb, "olympia_mau_de_thi_chuan.xlsx");
  };

  // Helper to parse Excel workbook and apply to state
  const parseAndApplyExcel = (wb: any) => {
    // Normalize helper function for accent-insensitive string matching
    const normalizeStr = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");

        // Parse Settings / Cài đặt flags if present
        const uploadFlags = {
          KHOI_DONG: true,
          VCNV: true,
          TANG_TOC: true,
          VE_DICH: true,
          CH_PHU: true,
          MEDIA: true,
          JEOPARDY: true,
          MA_TRAN_KEP: true,
          CHINH_PHUC: true,
          DAU_TRI: true
        };

        const settingsSheetName = wb.SheetNames.find(n => {
          const norm = normalizeStr(n);
          return norm.includes("cai dat") || norm.includes("settings");
        });

        if (settingsSheetName) {
          const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[settingsSheetName]);
          rows.forEach(r => {
            const code = String(r["Mã Vòng"] || r["Phần / Vòng Thi"] || r["Tên Vòng"] || r["Mã"] || "").toUpperCase();
            const normCode = normalizeStr(code);
            const val = r["Upload (1: Có, 0: Không)"] !== undefined ? r["Upload (1: Có, 0: Không)"] : r["Upload"] !== undefined ? r["Upload"] : r["Trạng Thái"] !== undefined ? r["Trạng Thái"] : 1;
            
            const shouldUpload = !(val === 0 || String(val).trim() === "0" || String(val).toLowerCase().includes("không") || val === false);

            if (normCode.includes("khoi_dong") || normCode.includes("khoi dong")) uploadFlags.KHOI_DONG = shouldUpload;
            if (normCode.includes("vcnv") || normCode.includes("vuot chuong ngai vat")) uploadFlags.VCNV = shouldUpload;
            if (normCode.includes("tang_toc") || normCode.includes("tang toc")) uploadFlags.TANG_TOC = shouldUpload;
            if (normCode.includes("ve_dich") || normCode.includes("ve dich")) uploadFlags.VE_DICH = shouldUpload;
            if (normCode.includes("ch_phu") || normCode.includes("cau hoi phu")) uploadFlags.CH_PHU = shouldUpload;
            if (normCode.includes("media")) uploadFlags.MEDIA = shouldUpload;
            if (normCode.includes("jeopardy")) uploadFlags.JEOPARDY = shouldUpload;
            if (normCode.includes("ma_tran_kep") || normCode.includes("ma tran") || normCode.includes("kep")) uploadFlags.MA_TRAN_KEP = shouldUpload;
            if (normCode.includes("chinh_phuc") || normCode.includes("chinh phuc") || normCode.includes("gmdt")) uploadFlags.CHINH_PHUC = shouldUpload;
            if (normCode.includes("dau_tri") || normCode.includes("dau tri") || normCode.includes("brainiest")) uploadFlags.DAU_TRI = shouldUpload;
          });
        }

        let outKD: KhoiDongQuestion[] = khoiDongQs;
        let outVcnvWord: string = vcnvWord;
        let outVcnvImage: string = vcnvImage;
        let outVcnvSoHN: 4 | 8 = vcnvSoHN;
        let outVcnvRows: ObstacleRow[] = vcnvRows;
        let outTT: TangTocQuestion[] = tangTocQs;
        let outCaiTien: TangTocCaiTienQuestion[] = tangTocCaiTienQs;
        let outVD: VeDichQuestion[] = veDichQs;
        let outCHP: CauHoiPhuQuestion[] = cauHoiPhuQs;
        let outMedia: ExternalMediaItem[] = mediaNgoai;
        let outJeopardyBoardSize: '5x4' | '6x5' = jeopardyBoardSize;
        let outJeopardyCategories: any[] = jeopardyCategories;
        let outMtk: MaTranKepQuestion[] = maTranKepQs;
        let outDapAnNhieu: string[] = dapAnNhieu;
        let outCPDe: ChinhPhucQuestion[] = chinhPhucDeQs;
        let outCPTB: ChinhPhucQuestion[] = chinhPhucTrungBinhQs;
        let outCPKho: ChinhPhucQuestion[] = chinhPhucKhoQs;
        let outGmdt: GMDTQuestion[] = gmdtQs;
        let outDauTri: DauTriQuestion[] = dauTriQs;

        // 1. Parse Khởi Động
        if (uploadFlags.KHOI_DONG) {
          const kdSheetName = wb.SheetNames.find((n: string) => normalizeStr(n).includes("khoi dong"));
          if (kdSheetName) {
            const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[kdSheetName]);
            const parsedKD: KhoiDongQuestion[] = rows.map((r, i) => {
              const mediaObj = getMediaFromRow(r);
              return {
                id: r["ID"] || `KD_${i + 1}`,
                linh_vuc: r["Lĩnh Vực"] || r["Lĩnh vực"] || "Toán",
                noi_dung: r["Nội Dung Câu Hỏi"] || r["Nội dung"] || "",
                dap_an_dung: String(r["Đáp Án Đúng"] || r["Đáp án"] || "").trim().toUpperCase(),
                chu_thich: r["Chú Thích"] || r["Chú thích"] || "",
                media: mediaObj
              };
            });
            while (parsedKD.length < 36) {
              parsedKD.push({
                id: `KD_${parsedKD.length + 1}`,
                linh_vuc: 'Toán',
                noi_dung: '',
                dap_an_dung: '',
                chu_thich: ''
              });
            }
            outKD = parsedKD;
            setKhoiDongQs(parsedKD);
          }
        }

        // 2. Parse VCNV
        if (uploadFlags.VCNV) {
          const vcnvSheetName = wb.SheetNames.find(n => {
            const norm = normalizeStr(n);
            return norm.includes("vuot chuong ngai vat") || norm.includes("vcnv");
          });
          if (vcnvSheetName) {
            const sheet = wb.Sheets[vcnvSheetName];
            const aoa: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            
            let keyword = "";
            let imgUrl = "";
            let parsedSoHN: 4 | 8 = 4;
            const parsedRows: ObstacleRow[] = [];

            if (aoa[0] && aoa[0][1]) keyword = String(aoa[0][1]).trim().toUpperCase();
            if (aoa[1] && aoa[1][1]) imgUrl = String(aoa[1][1]).trim();
            if (aoa[2] && (aoa[2][1] === 8 || Number(aoa[2][1]) === 8)) {
              parsedSoHN = 8;
            }

            const targetRowsCount = parsedSoHN === 8 ? 8 : 5;

            for (let idx = 4; idx < 4 + targetRowsCount; idx++) {
              const r = aoa[idx] || [];
              
              const mediaUrl = r[4] ? String(r[4]).trim() : "";
              const mediaTypeRaw = r[5] ? String(r[5]).toLowerCase().trim() : "image";
              let mediaObj = undefined;
              if (mediaUrl) {
                let mediaType: 'image' | 'audio' | 'video' = 'image';
                if (mediaTypeRaw.includes("audio") || mediaTypeRaw.includes("âm") || mediaTypeRaw === "mp3" || mediaTypeRaw === "sound") {
                  mediaType = 'audio';
                } else if (mediaTypeRaw.includes("video") || mediaTypeRaw.includes("clip") || mediaTypeRaw.includes("mp4") || mediaTypeRaw === "phim") {
                  mediaType = 'video';
                }
                mediaObj = { url: mediaUrl, type: mediaType };
              }

              parsedRows.push({
                id: Number(r[0]) || (parsedRows.length + 1),
                cau_hoi: r[1] || "",
                dap_an: String(r[2] || "").trim().toUpperCase(),
                so_ky_tu: Number(r[3]) || (String(r[2] || "").replace(/\s+/g, '').length || 5),
                media: mediaObj
              });
            }

            while (parsedRows.length < targetRowsCount) {
              parsedRows.push({
                id: parsedRows.length + 1,
                cau_hoi: '',
                dap_an: '',
                so_ky_tu: 5
              });
            }

            outVcnvWord = keyword;
            outVcnvImage = imgUrl || "https://images.unsplash.com/photo-1543731068-7e0f5beff43a?w=800";
            outVcnvSoHN = parsedSoHN;
            outVcnvRows = parsedRows.slice(0, targetRowsCount);
            setVcnvWord(outVcnvWord);
            setVcnvImage(outVcnvImage);
            setVcnvSoHN(outVcnvSoHN);
            setVcnvRows(outVcnvRows);
          }
        }

        // 3. Parse Tăng Tốc
        if (uploadFlags.TANG_TOC) {
          const ttSheetName = wb.SheetNames.find(n => {
            const norm = normalizeStr(n);
            return norm.includes("tang toc") && !norm.includes("cai tien");
          });
          if (ttSheetName) {
            const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[ttSheetName]);
            const parsedTT: TangTocQuestion[] = rows.map((r, i) => {
              const mediaObj = getMediaFromRow(r);
              const tgRaw = Number(r["Thời Gian (Giây)"]);
              return {
                id: Number(r["ID"]) || (i + 1),
                noi_dung: r["Nội Dung Mô Tả"] || r["Nội dung"] || "",
                dap_an_dung: String(r["Đáp Án Đúng"] || r["Đáp án"] || "").trim().toUpperCase(),
                thoi_gian: (tgRaw === 10 || tgRaw === 20 || tgRaw === 30 || tgRaw === 40) ? tgRaw : (i < 2 ? 20 : 30),
                chu_thich: r["Giải Thích"] || r["Chú Thích"] || r["Giải thích"] || r["Chú thích"] || r["Giải thích đáp án"] || "",
                media: mediaObj
              };
            });
            while (parsedTT.length < 4) {
              parsedTT.push({
                id: parsedTT.length + 1,
                noi_dung: '',
                dap_an_dung: '',
                thoi_gian: parsedTT.length < 2 ? 20 : 30
              });
            }
            outTT = parsedTT.slice(0, 4);
            setTangTocQs(outTT);
          }

          // Parse Tăng Tốc - Cải Tiến
          const ttCaiTienSheetName = wb.SheetNames.find((n: string) => normalizeStr(n).includes("cai tien"));
          if (ttCaiTienSheetName) {
            const rawRows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[ttCaiTienSheetName], { header: 1 });
            const parsedCaiTien: TangTocCaiTienQuestion[] = [];
            let rIdx = 0;
            while (rIdx < rawRows.length && parsedCaiTien.length < 4) {
              const row = rawRows[rIdx];
              if (row && row.length >= 1 && row[0] !== undefined && row[0] !== null && String(row[0]).trim() !== "" && String(row[0]) !== "STT Gợi Ý") {
                // Check if this row is a question header row
                const qId = Number(row[0]) || (parsedCaiTien.length + 1);
                const noiDung = String(row[1] || "").trim();
                const dapAn = String(row[2] || "").trim().toUpperCase();
                const loai = Number(row[3]) === 3 ? 3 : 4;

                let hintStartIdx = rIdx + 1;
                if (rawRows[hintStartIdx] && String(rawRows[hintStartIdx][0] || "").includes("STT")) {
                  hintStartIdx = rIdx + 2;
                }

                const hints: TangTocCaiTienHint[] = [];
                const hintCount = loai;
                for (let h = 1; h <= hintCount; h++) {
                  const hRow = rawRows[hintStartIdx + h - 1] || [];
                  const hText = String(hRow[1] || "").trim();
                  const hMediaUrl = hRow[2] ? String(hRow[2]).trim() : "";
                  hints.push({
                    stt: h,
                    noi_dung: hText,
                    media: hMediaUrl ? { url: hMediaUrl, type: 'image' } : undefined
                  });
                }

                parsedCaiTien.push({
                  id: qId,
                  loai_cau_hoi: loai,
                  noi_dung: noiDung,
                  dap_an_dung: dapAn,
                  goi_y: hints
                });

                rIdx += 6;
              } else {
                rIdx++;
              }
            }

            while (parsedCaiTien.length < 4) {
              const len = parsedCaiTien.length;
              parsedCaiTien.push({
                id: len + 1,
                loai_cau_hoi: len % 2 === 0 ? 3 : 4,
                noi_dung: '',
                dap_an_dung: '',
                goi_y: Array.from({ length: len % 2 === 0 ? 3 : 4 }, (_, h) => ({ stt: h + 1, noi_dung: '' }))
              });
            }

            outCaiTien = parsedCaiTien.slice(0, 4);
            setTangTocCaiTienQs(outCaiTien);
          }
        }

        // 4. Parse Về Đích
        if (uploadFlags.VE_DICH) {
          const vdSheetName = wb.SheetNames.find((n: string) => normalizeStr(n).includes("ve dich"));
          if (vdSheetName) {
            const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[vdSheetName]);
            const parsedVD: VeDichQuestion[] = rows.map((r) => {
              const mediaObj = getMediaFromRow(r);
              let points = Number(r["Mức Điểm"]) as 10 | 20 | 30 | 40;
              if (![10, 20, 30, 40].includes(points)) points = 20;
              return {
                id: r["ID"] || "",
                noi_dung: r["Nội Dung Câu Hỏi"] || r["Nội dung"] || "",
                dap_an_dung: String(r["Đáp Án Đúng"] || r["Đáp án"] || "").trim().toUpperCase(),
                muc_diem: points,
                linh_vuc: r["Lĩnh Vực"] || r["Lĩnh vực"] || "Khoa học tổng hợp",
                chu_thich: r["Giải Thích"] || r["Giải thích"] || r["Chú Thích"] || r["Chú thích"] || "",
                media: mediaObj
              };
            });

            // Assign correct sequentially numbered IDs matching pattern VD10_X, VD20_Y, VD30_Z, VD40_T
            const counts: Record<number, number> = { 10: 0, 20: 0, 30: 0, 40: 0 };
            parsedVD.forEach(q => {
              counts[q.muc_diem] = (counts[q.muc_diem] || 0) + 1;
              if (!q.id || !q.id.startsWith(`VD${q.muc_diem}_`)) {
                q.id = `VD${q.muc_diem}_${counts[q.muc_diem]}`;
              }
            });

            parsedVD.sort((a, b) => a.muc_diem - b.muc_diem);
            outVD = parsedVD;
            setVeDichQs(parsedVD);
          }
        }

        // 5. Parse Câu Hỏi Phụ
        if (uploadFlags.CH_PHU) {
          const chpSheetName = wb.SheetNames.find((n: string) => normalizeStr(n).includes("cau hoi phu") || normalizeStr(n).includes("ch_phu"));
          if (chpSheetName) {
            const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[chpSheetName]);
            const parsedCHP: CauHoiPhuQuestion[] = rows.map((r, i) => {
              const mediaObj = getMediaFromRow(r);
              return {
                id: Number(r["ID"]) || (i + 1),
                noi_dung: r["Nội Dung Câu Hỏi Phụ"] || r["Nội dung"] || "",
                dap_an_dung: String(r["Đáp Án Đúng"] || r["Đáp án"] || "").trim().toUpperCase(),
                chu_thich: r["Chú Thích"] || r["Chú thích"] || r["Giải Thích"] || r["Giải thích"] || "",
                media: mediaObj
              };
            });
            while (parsedCHP.length < 25) {
              parsedCHP.push({
                id: parsedCHP.length + 1,
                noi_dung: '',
                dap_an_dung: ''
              });
            }
            outCHP = parsedCHP.slice(0, 25);
            setCauHoiPhuQs(outCHP);
          }
        }

        // 6. Parse Media ngoài
        if (uploadFlags.MEDIA) {
          const mediaSheetName = wb.SheetNames.find((n: string) => normalizeStr(n).includes("media"));
          if (mediaSheetName) {
            const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[mediaSheetName]);
            const parsedMedia: ExternalMediaItem[] = rows.map((r, i) => {
              const url = String(r["Đường Dẫn (URL)"] || r["Đường Dẫn Media (URL)"] || r["URL"] || r["Đường Dẫn"] || "").trim();
              const typeRaw = String(r["Loại Media (AUDIO/IMAGE/VIDEO)"] || r["Loại Media"] || r["Loại"] || "").toLowerCase().trim();
              let type: 'audio' | 'image' | 'video' = 'image';
              if (typeRaw.includes("audio") || typeRaw.includes("âm") || typeRaw === "mp3" || typeRaw === "sound") {
                type = 'audio';
              } else if (typeRaw.includes("video") || typeRaw.includes("clip") || typeRaw.includes("mp4") || typeRaw === "phim") {
                type = 'video';
              }
              return {
                id: String(r["ID"] || `MEDIA_${i + 1}`),
                name: String(r["Tên Media"] || r["Tên"] || `Media ${i + 1}`),
                url,
                type
              };
            }).filter(m => m.url.length > 0);
            outMedia = parsedMedia;
            setMediaNgoai(parsedMedia);
          }
        }

        // 7. Parse Jeopardy!
        if (uploadFlags.JEOPARDY) {
          const jpSheetName = wb.SheetNames.find(n => normalizeStr(n).includes("jeopardy"));
          if (jpSheetName) {
            const rawRows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[jpSheetName], { header: 1 });
            let boardSize: '5x4' | '6x5' = '5x4';
            if (rawRows[0] && rawRows[0][1] && String(rawRows[0][1]).includes("6x5")) {
              boardSize = '6x5';
            }

            const catMap: Map<string, { title: string; clues: any[] }> = new Map();
            let currentCategoryTitle = "";
            const catClueCounts: Map<string, number> = new Map();

            const headerRow = rawRows[1] || [];
            const header0 = String(headerRow[0] || "").toLowerCase();
            const isOld7ColFormat = header0.includes("mã chủ đề") || (headerRow.length >= 7 && String(headerRow[1] || "").toLowerCase().includes("tên chủ đề"));

            for (let r = 2; r < rawRows.length; r++) {
              const row = rawRows[r];
              if (!row || row.length === 0) continue;

              let catTitle = "";
              let qNumOrPoints = "";
              let question = "";
              let dapAn = "";
              let mediaUrl = "";
              let mediaTypeRaw = "";

              if (isOld7ColFormat) {
                catTitle = String(row[1] || "").trim().toUpperCase();
                qNumOrPoints = String(row[2] || "").trim();
                question = String(row[3] || "").trim();
                dapAn = String(row[4] || "").trim().toUpperCase();
                mediaUrl = String(row[5] || "").trim();
                mediaTypeRaw = String(row[6] || "").toLowerCase().trim();
              } else {
                // New layout (CATEGORY, Q#, QUESTION, ANSWER, MEDIA LINK, MEDIA TYPE)
                const cellA = String(row[0] || "").trim().toUpperCase();
                if (cellA && !cellA.includes("KÍCH THƯỚC") && !cellA.includes("CATEGORY") && !cellA.includes("CHỦ ĐỀ")) {
                  currentCategoryTitle = cellA;
                }
                catTitle = currentCategoryTitle;
                qNumOrPoints = String(row[1] || "").trim();
                question = String(row[2] || "").trim();
                dapAn = String(row[3] || "").trim().toUpperCase();
                mediaUrl = String(row[4] || "").trim();
                mediaTypeRaw = String(row[5] || "").toLowerCase().trim();
              }

              if (!catTitle || !question || question.toLowerCase().includes("question") || question.toLowerCase().includes("câu hỏi")) continue;

              let points = 0;
              const cleanStr = qNumOrPoints.trim();
              const directNum = Number(cleanStr.replace(/[^\d.-]/g, ''));
              if (!isNaN(directNum) && directNum > 0 && !cleanStr.toUpperCase().startsWith('Q')) {
                points = directNum;
              } else if (cleanStr.toUpperCase().startsWith('Q')) {
                const extraNum = cleanStr.match(/Q\d+.*?(\d+)/i);
                if (extraNum) {
                  points = Number(extraNum[1]);
                } else {
                  const matchQ = cleanStr.toUpperCase().match(/Q(\d+)/);
                  if (matchQ) {
                    points = Number(matchQ[1]) * 10;
                  }
                }
              }

              if (!points || isNaN(points)) {
                const currentCount = catClueCounts.get(catTitle) || 0;
                points = (currentCount + 1) * 10;
              }

              let mediaType: 'image' | 'video' | 'audio' = 'image';
              if (mediaTypeRaw.includes("video") || mediaTypeRaw.includes("mp4") || mediaTypeRaw.includes("clip")) {
                mediaType = 'video';
              } else if (mediaTypeRaw.includes("audio") || mediaTypeRaw.includes("mp3") || mediaTypeRaw.includes("âm")) {
                mediaType = 'audio';
              }
              const media = mediaUrl ? { url: mediaUrl, type: mediaType } : undefined;

              if (!catMap.has(catTitle)) {
                catMap.set(catTitle, { title: catTitle, clues: [] });
              }
              catMap.get(catTitle)!.clues.push({
                points,
                question,
                dap_an_dung: dapAn,
                media
              });
              catClueCounts.set(catTitle, (catClueCounts.get(catTitle) || 0) + 1);
            }

            let parsedCategories = Array.from(catMap.values());
            if (boardSize === '5x4') {
              // 5x4: Đọc 4 gợi ý đầu tiên của 5 chủ đề đầu tiên
              parsedCategories = parsedCategories.slice(0, 5).map(cat => ({
                ...cat,
                clues: cat.clues.slice(0, 4)
              }));
            } else {
              // 6x5: Đọc trọn vẹn 30 gợi ý (6 chủ đề x 5 gợi ý)
              parsedCategories = parsedCategories.slice(0, 6).map(cat => ({
                ...cat,
                clues: cat.clues.slice(0, 5)
              }));
            }

            if (parsedCategories.length > 0) {
              outJeopardyBoardSize = boardSize;
              outJeopardyCategories = parsedCategories;
              setJeopardyBoardSize(boardSize);
              setJeopardyCategories(parsedCategories);
            }
          }
        }

        // 8. Parse Ma Trận Kép
        if (uploadFlags.MA_TRAN_KEP) {
          const mtkSheetName = wb.SheetNames.find((n: string) => {
            const norm = normalizeStr(n);
            return norm.includes("ma tran") || norm.includes("matran") || norm.includes("kep") || norm.includes("matrix") || norm.includes("gridlocked");
          });
          if (mtkSheetName) {
            const sheet = wb.Sheets[mtkSheetName];
            const rows: any[] = XLSX.utils.sheet_to_json(sheet);
            const aoaRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            let parsedMtk: MaTranKepQuestion[] = rows.map((r, i) => {
              const noi_dung = String(
                r["Nội Dung Câu Hỏi"] || r["Nội dung câu hỏi"] || r["Nội dung"] || r["Câu hỏi"] || r["Nội Dung"] || r["NoiDung"] || r["NOI_DUNG"] || r["Question"] || ""
              ).trim();
              const dap_an_1 = String(
                r["Đáp Án 1"] || r["Đáp án 1"] || r["DapAn1"] || r["DAP_AN_1"] || r["Đáp Án Đúng 1"] || r["Đúng 1"] || ""
              ).trim().toUpperCase();
              const dap_an_2 = String(
                r["Đáp Án 2"] || r["Đáp án 2"] || r["DapAn2"] || r["DAP_AN_2"] || r["Đáp Án Đúng 2"] || r["Đúng 2"] || ""
              ).trim().toUpperCase();
              return {
                id: i + 1,
                noi_dung,
                dap_an_1,
                dap_an_2
              };
            }).filter(q => q.noi_dung.length > 0 && (q.dap_an_1.length > 0 || q.dap_an_2.length > 0));

            // Fallback AoA parsing if object-based parsing produced 0 questions
            if (parsedMtk.length === 0 && aoaRows && aoaRows.length > 1) {
              for (let rIdx = 0; rIdx < aoaRows.length; rIdx++) {
                const row = aoaRows[rIdx];
                if (!row || row.length < 3) continue;
                const col0 = String(row[0] || "").trim();
                const col1 = String(row[1] || "").trim();
                const col2 = String(row[2] || "").trim();
                const col3 = String(row[3] || "").trim();

                if (col0.toLowerCase().includes("stt") && col1.toLowerCase().includes("nội dung")) continue;
                if (col0.toLowerCase().includes("nội dung") || col1.toLowerCase().includes("câu hỏi")) continue;

                const qText = col1.length > 0 ? col1 : col0;
                const a1 = col2.trim().toUpperCase();
                const a2 = col3.trim().toUpperCase();
                if (qText.length > 0 && (a1.length > 0 || a2.length > 0)) {
                  parsedMtk.push({
                    id: parsedMtk.length + 1,
                    noi_dung: qText,
                    dap_an_1: a1,
                    dap_an_2: a2
                  });
                }
              }
            }

            const parsedDistractors: string[] = [];
            rows.forEach(r => {
              const dist1 = String(
                r["Đáp Án Nhiễu 1"] || r["Đáp án nhiễu 1"] || r["Đáp Án Nhiễu (Cột 1)"] || r["Đáp Án Nhiễu (tối đa 24)"] || r["Đáp Án Nhiễu (tối đa 12)"] || r["Đáp Án Nhiễu"] || r["Đáp án nhiễu"] || r["DapAnNhieu"] || r["Nhiễu 1"] || r["Nhiễu"] || ""
              ).trim().toUpperCase();
              const dist2 = String(
                r["Đáp Án Nhiễu 2"] || r["Đáp án nhiễu 2"] || r["Đáp Án Nhiễu (Cột 2)"] || r["DapAnNhieu2"] || r["Nhiễu 2"] || ""
              ).trim().toUpperCase();

              if (dist1 && !parsedDistractors.includes(dist1) && parsedDistractors.length < 24) {
                parsedDistractors.push(dist1);
              }
              if (dist2 && !parsedDistractors.includes(dist2) && parsedDistractors.length < 24) {
                parsedDistractors.push(dist2);
              }
            });

            // AoA fallback for distractors if object parsing found none
            if (parsedDistractors.length === 0 && aoaRows) {
              aoaRows.forEach(row => {
                if (!row) return;
                for (let c = 4; c < row.length; c++) {
                  const val = String(row[c] || "").trim().toUpperCase();
                  if (val && !val.includes("NHIỄU") && !val.includes("CỘT") && !parsedDistractors.includes(val) && parsedDistractors.length < 24) {
                    parsedDistractors.push(val);
                  }
                }
              });
            }

            if (parsedMtk.length > 0) {
              outMtk = parsedMtk;
              setMaTranKepQs(parsedMtk);
            }
            if (parsedDistractors.length > 0) {
              outDapAnNhieu = parsedDistractors;
              setDapAnNhieu(parsedDistractors);
            }
          }
        }

        // 9. Parse Chinh Phục & GMĐT
        if (uploadFlags.CHINH_PHUC) {
          const cpSheetName = wb.SheetNames.find((n: string) => {
            const norm = normalizeStr(n);
            return norm.includes("chinh phuc") || norm.includes("chinh_phuc") || norm.includes("conquest");
          });
          
          let parsedGmdtFlag = false;

          if (cpSheetName) {
            const cpSheet = wb.Sheets[cpSheetName];
            const rows: any[] = XLSX.utils.sheet_to_json(cpSheet);
            const aoaRows: any[][] = XLSX.utils.sheet_to_json(cpSheet, { header: 1 });

            // 9a. Check top rows for GMDT in combined sheet
            if (aoaRows && aoaRows.length > 0) {
              for (let i = 0; i < Math.min(10, aoaRows.length); i++) {
                const r = aoaRows[i];
                if (!r) continue;

                // Check if this row is a header row (contains "goi y" or "dap an cuoi", but NOT banner "===")
                const isHeaderRow = r.some((c: any) => {
                  const cStr = normalizeStr(String(c || ""));
                  return !cStr.includes("===") && (cStr.includes("goi y") || cStr.includes("dap an cuoi") || cStr.includes("mat ma"));
                });

                if (isHeaderRow) {
                  const goiYCol = r.findIndex((c: any) => {
                    const cStr = normalizeStr(String(c || ""));
                    return !cStr.includes("===") && cStr.includes("goi y");
                  });
                  const ansCol = r.findIndex((c: any) => {
                    const cStr = normalizeStr(String(c || ""));
                    return !cStr.includes("===") && (cStr.includes("dap an") || cStr.includes("mat ma"));
                  });

                  for (let j = i + 1; j < Math.min(i + 5, aoaRows.length); j++) {
                    const dataRow = aoaRows[j];
                    if (!dataRow || dataRow.length === 0) continue;

                    const dataStr = dataRow.map((c: any) => normalizeStr(String(c || ""))).join(" ");
                    if (dataStr.includes("===") || dataStr.includes("cau hoi chinh phuc") || dataStr.includes("stt")) {
                      break;
                    }

                    const goiYVal = String(
                      (goiYCol >= 0 && dataRow[goiYCol] !== undefined)
                        ? dataRow[goiYCol]
                        : (dataRow[2] !== undefined ? dataRow[2] : (dataRow[0] || ""))
                    ).trim();

                    const rawAnsVal = String(
                      (ansCol >= 0 && dataRow[ansCol] !== undefined)
                        ? dataRow[ansCol]
                        : (dataRow[3] !== undefined ? dataRow[3] : (dataRow[1] || ""))
                    ).trim();

                    const normGoiY = normalizeStr(goiYVal);
                    const normAns = normalizeStr(rawAnsVal);
                    if (normGoiY.includes("goi y") || normAns.includes("dap an cuoi") || normAns.includes("mat ma")) {
                      continue; // Skip header repetition
                    }

                    if (rawAnsVal || goiYVal) {
                      const { cleanAnswer, matMa } = textToGmdtMatMa(rawAnsVal);
                      outGmdt = [{ goi_y: goiYVal, dap_an_dung: cleanAnswer, mat_ma: matMa }];
                      setGmdtQs(outGmdt);
                      parsedGmdtFlag = true;
                      break;
                    }
                  }

                  if (parsedGmdtFlag) break;
                }
              }
            }

            if (!parsedGmdtFlag && rows.length > 0) {
              for (const r of rows) {
                const goiYKey = Object.keys(r).find(k => normalizeStr(k).includes("goi y"));
                const ansKey = Object.keys(r).find(k => normalizeStr(k).includes("dap an cuoi") || normalizeStr(k).includes("dap an gmdt"));
                if (goiYKey || ansKey) {
                  const goiY = String(r[goiYKey || ""] || "").trim();
                  const rawAns = String(r[ansKey || ""] || "").trim();
                  const normGoiY = normalizeStr(goiY);
                  const normAns = normalizeStr(rawAns);
                  if (!normGoiY.includes("goi y") && !normAns.includes("dap an cuoi") && (rawAns || goiY)) {
                    const { cleanAnswer, matMa } = textToGmdtMatMa(rawAns);
                    outGmdt = [{ goi_y: goiY, dap_an_dung: cleanAnswer, mat_ma: matMa }];
                    setGmdtQs(outGmdt);
                    parsedGmdtFlag = true;
                    break;
                  }
                }
              }
            }

            // 9b. Parse Chinh Phuc questions (30 Easy, 30 Medium, 30 Hard)
            let cpHeaderRowIndex = -1;
            if (aoaRows && aoaRows.length > 0) {
              for (let i = 0; i < aoaRows.length; i++) {
                const r = aoaRows[i];
                if (!r) continue;
                const rStr = r.map((c: any) => normalizeStr(String(c || ""))).join(" ");
                if (
                  rStr.includes("noi dung") ||
                  (rStr.includes("cau hoi") && !rStr.includes("===") && !rStr.includes("minigame")) ||
                  (rStr.includes("stt") && (rStr.includes("dap an") || rStr.includes("muc diem") || rStr.includes("diem")))
                ) {
                  cpHeaderRowIndex = i;
                  break;
                }
              }
            }

            const cpRows: any[] = cpHeaderRowIndex >= 0
              ? XLSX.utils.sheet_to_json(cpSheet, { range: cpHeaderRowIndex })
              : XLSX.utils.sheet_to_json(cpSheet);

            const deList: ChinhPhucQuestion[] = [];
            const tbList: ChinhPhucQuestion[] = [];
            const khoList: ChinhPhucQuestion[] = [];

            cpRows.forEach((r, idx) => {
              const noiDung = String(
                r["Nội Dung Câu Hỏi"] || r["Nội dung câu hỏi"] || r["Nội dung"] || r["Câu hỏi"] || r["Nội Dung"] || r["NoiDung"] || r["Question"] || ""
              ).trim();

              if (!noiDung || noiDung.startsWith("===") || normalizeStr(noiDung).includes("cau hoi chinh phuc")) return;

              const mediaObj = getMediaFromRow(r);
              const pts = Number(r["Mức Điểm"] || r["Mức điểm"] || r["Điểm"] || r["Points"] || 0);
              const levelStr = normalizeStr(String(r["Mức Độ"] || r["Mức độ"] || r["Loại"] || ""));

              const item: ChinhPhucQuestion = {
                id: String(r["ID"] || `CP_${idx + 1}`),
                noi_dung: noiDung,
                dap_an_dung: String(r["Đáp Án Đúng"] || r["Đáp án đúng"] || r["Đáp án"] || r["Đáp Án"] || r["Answer"] || "").trim().toUpperCase(),
                muc_diem: (pts === 10 || pts === 20 || pts === 30 ? pts : 10) as 10 | 20 | 30,
                chu_thich: String(r["Chú Thích"] || r["Chú thích"] || r["Giải Thích"] || r["Giải thích"] || "").trim(),
                media: mediaObj
              };

              if (pts === 10 || levelStr.includes("de")) {
                item.muc_diem = 10;
                if (deList.length < 30) deList.push(item);
              } else if (pts === 20 || levelStr.includes("trung binh")) {
                item.muc_diem = 20;
                if (tbList.length < 30) tbList.push(item);
              } else if (pts === 30 || levelStr.includes("kho")) {
                item.muc_diem = 30;
                if (khoList.length < 30) khoList.push(item);
              } else {
                if (deList.length < 30) {
                  item.muc_diem = 10;
                  deList.push(item);
                } else if (tbList.length < 30) {
                  item.muc_diem = 20;
                  tbList.push(item);
                } else if (khoList.length < 30) {
                  item.muc_diem = 30;
                  khoList.push(item);
                }
              }
            });

            // AoA Fallback if cpRows yielded 0 questions
            if (deList.length === 0 && tbList.length === 0 && khoList.length === 0 && aoaRows && aoaRows.length > 0) {
              const startRow = cpHeaderRowIndex >= 0 ? cpHeaderRowIndex + 1 : 0;
              for (let i = startRow; i < aoaRows.length; i++) {
                const r = aoaRows[i];
                if (!r || r.length < 2) continue;

                const rCells = r.map((c: any) => String(c || "").trim());
                const fullStr = normalizeStr(rCells.join(" "));
                if (fullStr.includes("===") || fullStr.includes("noi dung cau hoi") || fullStr.includes("minigame") || fullStr.includes("goi y gmdt")) continue;

                let pts = 0;
                rCells.forEach(cVal => {
                  const num = Number(cVal);
                  if (num === 10 || num === 20 || num === 30) pts = num;
                });

                const textCols = rCells.filter(c => c.length > 0 && !["10", "20", "30"].includes(c) && !c.toLowerCase().startsWith("http"));
                const qCandidate = textCols.find(c => c.length > 3 && isNaN(Number(c)));
                if (qCandidate) {
                  const qIdx = textCols.indexOf(qCandidate);
                  const qText = qCandidate;
                  const qAns = textCols[qIdx + 1] ? textCols[qIdx + 1].toUpperCase() : "";
                  const qNote = textCols[qIdx + 2] || "";

                  const item: ChinhPhucQuestion = {
                    id: `CP_${deList.length + tbList.length + khoList.length + 1}`,
                    noi_dung: qText,
                    dap_an_dung: qAns,
                    muc_diem: (pts === 10 || pts === 20 || pts === 30 ? pts : 10) as 10 | 20 | 30,
                    chu_thich: qNote
                  };

                  if (item.muc_diem === 10 && deList.length < 30) deList.push(item);
                  else if (item.muc_diem === 20 && tbList.length < 30) tbList.push(item);
                  else if (item.muc_diem === 30 && khoList.length < 30) khoList.push(item);
                  else if (deList.length < 30) { item.muc_diem = 10; deList.push(item); }
                  else if (tbList.length < 30) { item.muc_diem = 20; tbList.push(item); }
                  else if (khoList.length < 30) { item.muc_diem = 30; khoList.push(item); }
                }
              }
            }

            if (deList.length > 0) {
              outCPDe = deList;
              setChinhPhucDeQs(deList);
            }
            if (tbList.length > 0) {
              outCPTB = tbList;
              setChinhPhucTrungBinhQs(tbList);
            }
            if (khoList.length > 0) {
              outCPKho = khoList;
              setChinhPhucKhoQs(khoList);
            }
          }

          // 9c. Backwards compatibility for separate GMDT sheet
          if (!parsedGmdtFlag) {
            const gmdtSheetName = wb.SheetNames.find((n: string) => {
              const norm = normalizeStr(n);
              return norm.includes("giai ma dien thoai") || norm.includes("gmdt") || norm.includes("phone") || norm.includes("mat ma");
            });
            if (gmdtSheetName) {
              const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[gmdtSheetName]);
              if (rows.length > 0) {
                const r = rows[0];
                const rawAns = String(r["Đáp Án Đúng"] || r["Đáp án"] || r["Answer"] || r["Đáp Án Cuối"] || "").trim();
                const goiY = String(r["Gợi Ý"] || r["Gợi ý"] || r["Hint"] || "").trim();
                const { cleanAnswer, matMa } = textToGmdtMatMa(rawAns);
                outGmdt = [{
                  mat_ma: String(r["Mật Mã Số"] || r["Mật mã"] || matMa || "").trim(),
                  goi_y: goiY,
                  dap_an_dung: cleanAnswer || rawAns.toUpperCase()
                }];
                setGmdtQs(outGmdt);
              }
            }
          }
        }

        // 10. Parse Đấu Trí (25 câu hỏi chính + 25 gói thưởng)
        let parsedDauTriQs: DauTriQuestion[] = [];
        if (uploadFlags.DAU_TRI) {
          // Find main questions sheet (e.g. "Đấu Trí")
          const dtMainSheetName = wb.SheetNames.find((n: string) => {
            const norm = normalizeStr(n);
            return (norm.includes("dau tri") || norm.includes("dau_tri") || norm.includes("brainiest") || norm.includes("university challenge"))
              && !norm.includes("cau thuong") && !norm.includes("cau_thuong") && !norm.includes("bonus") && !norm.includes("goi thuong") && !norm.includes("goi_thuong");
          });

          // Find bonus questions sheet (e.g. "Đấu trí_Câu thưởng")
          const dtBonusSheetName = wb.SheetNames.find((n: string) => {
            const norm = normalizeStr(n);
            return (norm.includes("dau tri") || norm.includes("dau_tri")) && (norm.includes("cau thuong") || norm.includes("cau_thuong") || norm.includes("bonus") || norm.includes("goi thuong") || norm.includes("goi_thuong"));
          }) || wb.SheetNames.find((n: string) => {
            const norm = normalizeStr(n);
            return norm.includes("cau thuong") || norm.includes("cau_thuong") || norm.includes("bonus");
          });

          if (dtMainSheetName || dtBonusSheetName) {
            // Initialize 25 default slots
            const dtList: DauTriQuestion[] = createDefaultDauTriQs();

            // 10.1 Parse Main Questions Sheet if present
            if (dtMainSheetName) {
              const dtSheet = wb.Sheets[dtMainSheetName];
              const rows: any[] = XLSX.utils.sheet_to_json(dtSheet);
              const aoaRows: any[][] = XLSX.utils.sheet_to_json(dtSheet, { header: 1 });

              if (rows && rows.length > 0) {
                rows.forEach((r, idx) => {
                  const qNum = Number(r["STT"] || r["Số Thứ Tự"] || r["No"] || idx + 1);
                  const qIdx = qNum >= 1 && qNum <= 25 ? qNum - 1 : idx < 25 ? idx : -1;
                  if (qIdx < 0 || qIdx >= 25) return;

                  const noiDung = String(r["Nội Dung Câu Hỏi Chính"] || r["Câu Hỏi Chính"] || r["Câu hỏi chính"] || r["Nội Dung Câu Hỏi"] || r["Câu hỏi"] || r["Nội Dung"] || "").trim();
                  const dapAn = String(r["Đáp Án Câu Chính"] || r["Đáp án câu chính"] || r["Đáp Án Đúng"] || r["Đáp án đúng"] || r["Đáp Án"] || r["Đáp án"] || "").trim().toUpperCase();
                  const chuThich = String(r["Giải Thích Câu Chính"] || r["Giải thích câu chính"] || r["Chú Thích"] || r["Giải Thích"] || "").trim();
                  const mediaUrl = String(r["Media Câu Chính (URL)"] || r["Media Câu Chính"] || r["Media (URL)"] || r["Media URL"] || r["Media"] || "").trim();
                  const mediaTypeRaw = String(r["Loại Media Câu Chính"] || r["Loại Media"] || "image").toLowerCase().trim();
                  let mediaType: 'image' | 'video' | 'audio' = mediaTypeRaw.includes("video") ? 'video' : mediaTypeRaw.includes("audio") ? 'audio' : 'image';
                  if (mediaUrl && !r["Loại Media Câu Chính"] && !r["Loại Media"]) {
                    if (mediaUrl.match(/\.(mp3|wav|ogg|m4a)($|\?)/i)) mediaType = 'audio';
                    else if (mediaUrl.match(/\.(mp4|webm|mov)($|\?)/i) || mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')) mediaType = 'video';
                  }

                  dtList[qIdx].id = qIdx + 1;
                  if (noiDung) dtList[qIdx].noi_dung = noiDung;
                  if (dapAn) dtList[qIdx].dap_an_dung = dapAn;
                  if (chuThich) dtList[qIdx].chu_thich = chuThich;
                  dtList[qIdx].media = mediaUrl ? { url: mediaUrl, type: mediaType } : undefined;

                  // Backward compatibility with legacy horizontal bonus format on the main sheet
                  if (r["Chủ Đề Gói Thưởng"] || r["Chủ Đề"]) {
                    dtList[qIdx].goi_thuong.chu_de = String(r["Chủ Đề Gói Thưởng"] || r["Chủ Đề"]).trim();
                  }
                  if (r["Câu Thưởng 1"] || r["Câu Thưởng 2"] || r["Câu Thưởng 3"]) {
                    [1, 2, 3].forEach(bNum => {
                      const bNoiDung = String(r[`Câu Thưởng ${bNum}`] || "").trim();
                      const bDapAn = String(r[`Đáp Án Thưởng ${bNum}`] || "").trim().toUpperCase();
                      const bChuThich = String(r[`Giải Thích Thưởng ${bNum}`] || "").trim();
                      const bMediaUrl = String(r[`Media Thưởng ${bNum} (URL)`] || r[`Media Thưởng ${bNum}`] || "").trim();
                      if (bNoiDung || bDapAn) {
                        let bMediaType: 'image' | 'video' | 'audio' = 'image';
                        if (bMediaUrl.match(/\.(mp3|wav|ogg|m4a)($|\?)/i)) bMediaType = 'audio';
                        else if (bMediaUrl.match(/\.(mp4|webm|mov)($|\?)/i) || bMediaUrl.includes('youtube.com') || bMediaUrl.includes('youtu.be')) bMediaType = 'video';
                        dtList[qIdx].goi_thuong.cau_hoi[bNum - 1] = {
                          id: `${qIdx + 1}_${bNum}`,
                          noi_dung: bNoiDung,
                          dap_an_dung: bDapAn,
                          chu_thich: bChuThich,
                          media: bMediaUrl ? { url: bMediaUrl, type: bMediaType } : undefined
                        };
                      }
                    });
                  }
                });
              } else if (aoaRows && aoaRows.length > 1) {
                let rowIdx = 0;
                for (let i = 1; i < aoaRows.length; i++) {
                  const r = aoaRows[i];
                  if (!r || r.length < 2) continue;
                  if (rowIdx >= 25) break;
                  const qNum = Number(r[0] || rowIdx + 1);
                  const qIdx = qNum >= 1 && qNum <= 25 ? qNum - 1 : rowIdx;
                  const noiDung = String(r[1] || "").trim();
                  const dapAn = String(r[2] || "").trim().toUpperCase();
                  const chuThich = String(r[3] || "").trim();
                  const mediaUrl = String(r[4] || "").trim();
                  dtList[qIdx].noi_dung = noiDung;
                  dtList[qIdx].dap_an_dung = dapAn;
                  dtList[qIdx].chu_thich = chuThich;
                  if (mediaUrl) dtList[qIdx].media = { url: mediaUrl, type: 'image' };
                  rowIdx++;
                }
              }
            }

            // 10.2 Parse Bonus Questions Sheet if present (Vertical continuous layout, STT & theme only on row 1 of each pack)
            if (dtBonusSheetName) {
              const dtBonusSheet = wb.Sheets[dtBonusSheetName];
              const bonusRows: any[] = XLSX.utils.sheet_to_json(dtBonusSheet);
              const aoaBonusRows: any[][] = XLSX.utils.sheet_to_json(dtBonusSheet, { header: 1 });

              if (bonusRows && bonusRows.length > 0) {
                let currentPackIdx = 0;
                let currentBonusCountInPack = 0;

                bonusRows.forEach((r) => {
                  const rawNoiDung = String(r["Nội Dung Câu Hỏi Thưởng"] || r["Câu Hỏi Thưởng"] || r["Nội Dung Câu Thưởng"] || r["Câu Thưởng"] || r["Nội Dung"] || r["Câu Hỏi"] || "").trim();
                  const rawDapAn = String(r["Đáp Án Thưởng"] || r["Đáp Án Đúng"] || r["Đáp Án Câu Thưởng"] || r["Đáp Án"] || r["Đáp án"] || "").trim().toUpperCase();
                  const rawTheme = String(r["Chủ Đề Gói Thưởng"] || r["Chủ Đề"] || r["Chủ đề"] || r["Tên Chủ Đề"] || "").trim();

                  const packNumRaw = r["Gói STT"] !== undefined ? r["Gói STT"] : r["STT Gói Thưởng"] !== undefined ? r["STT Gói Thưởng"] : r["Gói Thưởng (STT)"] !== undefined ? r["Gói Thưởng (STT)"] : r["Gói Thưởng"] !== undefined ? r["Gói Thưởng"] : r["Gói"] !== undefined ? r["Gói"] : r["STT Gói"];
                  const chuThich = String(r["Giải Thích Thưởng"] || r["Giải Thích"] || r["Chú Thích"] || r["Ghi Chú"] || "").trim();
                  const mediaUrl = String(r["Media Thưởng (URL)"] || r["Media (URL)"] || r["Media Thưởng"] || r["Media URL"] || r["Media"] || "").trim();

                  // Skip empty spacer rows
                  if (!rawNoiDung && !rawDapAn && !rawTheme && (packNumRaw === undefined || String(packNumRaw).trim() === '') && !chuThich && !mediaUrl) {
                    return;
                  }

                  const pStr = String(packNumRaw !== undefined && packNumRaw !== null ? packNumRaw : "").trim();
                  if (pStr !== "") {
                    const packNum = Number(pStr);
                    if (!isNaN(packNum) && packNum >= 1 && packNum <= 25) {
                      currentPackIdx = packNum - 1;
                      currentBonusCountInPack = 0;
                    }
                  }

                  if (currentPackIdx < 0 || currentPackIdx >= 25) return;

                  if (rawTheme) {
                    dtList[currentPackIdx].goi_thuong.chu_de = rawTheme;
                  }

                  const bNumRaw = r["Câu Thưởng Số"] !== undefined ? r["Câu Thưởng Số"] : r["STT Câu Thưởng"] !== undefined ? r["STT Câu Thưởng"] : r["Câu Thưởng"] !== undefined ? r["Câu Thưởng"] : r["Câu Số"] !== undefined ? r["Câu Số"] : r["STT Câu"] !== undefined ? r["STT Câu"] : r["Câu"];
                  const bNum = Number(bNumRaw);
                  let bIdx = (!isNaN(bNum) && bNum >= 1 && bNum <= 3) ? bNum - 1 : currentBonusCountInPack;
                  if (bIdx > 2) bIdx = 2;

                  const mediaTypeRaw = String(r["Loại Media Thưởng"] || r["Loại Media"] || "image").toLowerCase().trim();
                  let mediaType: 'image' | 'video' | 'audio' = mediaTypeRaw.includes("video") ? 'video' : mediaTypeRaw.includes("audio") ? 'audio' : 'image';
                  if (mediaUrl && !r["Loại Media Thưởng"] && !r["Loại Media"]) {
                    if (mediaUrl.match(/\.(mp3|wav|ogg|m4a)($|\?)/i)) mediaType = 'audio';
                    else if (mediaUrl.match(/\.(mp4|webm|mov)($|\?)/i) || mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')) mediaType = 'video';
                  }

                  if (rawNoiDung || rawDapAn) {
                    dtList[currentPackIdx].goi_thuong.cau_hoi[bIdx] = {
                      id: `${currentPackIdx + 1}_${bIdx + 1}`,
                      noi_dung: rawNoiDung,
                      dap_an_dung: rawDapAn,
                      chu_thich: chuThich,
                      media: mediaUrl ? { url: mediaUrl, type: mediaType } : undefined
                    };
                    currentBonusCountInPack = (bIdx + 1) % 3;
                    if (currentBonusCountInPack === 0 && pStr === "" && currentPackIdx < 24) {
                      currentPackIdx++;
                    }
                  }
                });
              } else if (aoaBonusRows && aoaBonusRows.length > 1) {
                let curPack = 0;
                let curBonus = 0;
                for (let i = 1; i < aoaBonusRows.length; i++) {
                  const r = aoaBonusRows[i];
                  if (!r || r.length === 0) continue;
                  const pStr = String(r[0] !== undefined && r[0] !== null ? r[0] : "").trim();
                  if (pStr) {
                    const pNum = Number(pStr);
                    if (!isNaN(pNum) && pNum >= 1 && pNum <= 25) {
                      curPack = pNum - 1;
                      curBonus = 0;
                    }
                  }
                  const theme = String(r[1] || "").trim();
                  if (theme) dtList[curPack].goi_thuong.chu_de = theme;
                  const bNum = Number(r[2]);
                  const bIdx = (!isNaN(bNum) && bNum >= 1 && bNum <= 3) ? bNum - 1 : curBonus;
                  const qText = String(r[3] || "").trim();
                  const ansText = String(r[4] || "").trim().toUpperCase();
                  const noteText = String(r[5] || "").trim();
                  const mUrl = String(r[6] || "").trim();
                  if (qText || ansText) {
                    dtList[curPack].goi_thuong.cau_hoi[bIdx] = {
                      id: `${curPack + 1}_${bIdx + 1}`,
                      noi_dung: qText,
                      dap_an_dung: ansText,
                      chu_thich: noteText,
                      media: mUrl ? { url: mUrl, type: 'image' } : undefined
                    };
                    curBonus = (bIdx + 1) % 3;
                    if (curBonus === 0 && !pStr && curPack < 24) {
                      curPack++;
                    }
                  }
                }
              }
            }

            parsedDauTriQs = dtList;
            outDauTri = dtList;
            setDauTriQs(dtList);
          }
        }

    return {
      khoi_dong: { cau_hoi: outKD },
      vuot_chuong_ngai_vat: {
        tu_khoa_chinh: (outVcnvWord || '').toUpperCase(),
        anh_goc_url: outVcnvImage || '',
        so_hang_ngang: outVcnvSoHN,
        hang_ngang: outVcnvRows
      },
      tang_toc: { cau_hoi: outTT, cai_tien_cau_hoi: outCaiTien },
      ve_dich: { cau_hoi: outVD },
      cau_hoi_phu: { cau_hoi: outCHP },
      jeopardy: { boardSize: outJeopardyBoardSize, categories: outJeopardyCategories },
      ma_tran_kep: { cau_hoi: outMtk, dap_an_nhieu: outDapAnNhieu },
      chinh_phuc: {
        de_cau_hoi: {
          de: outCPDe,
          trung_binh: outCPTB,
          kho: outCPKho
        },
        gmdt: outGmdt
      },
      dau_tri: { cau_hoi: outDauTri },
      media_ngoai: outMedia
    };
  };

  // Import from Excel parsing
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        if (!matchCode) {
          const autoCode = generateUnique6DigitCode();
          const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").trim() || `Bộ đề ${autoCode}`;
          setExcelPendingWb(wb);
          setExcelPendingFileName(file.name);
          setExcelModalCode(autoCode);
          setExcelModalName(cleanName);
          setExcelModalPassword('123');
          setExcelModalError('');
          setShowExcelSaveModal(true);
          return;
        }

        parseAndApplyExcel(wb);
        setStatus({ type: 'success', message: "Nhập dữ liệu từ file Excel thành công! Đừng quên nhấn 'LƯU TOÀN BỘ ĐỀ THI' để lưu lên hệ thống." });
      } catch (err) {
        console.error(err);
        setStatus({ type: 'error', message: "Lỗi phân tích file Excel. Vui lòng kiểm tra định dạng template chuẩn." });
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Confirm Excel save when no match is active
  const handleConfirmExcelSave = async () => {
    if (!excelModalCode.trim()) {
      setExcelModalError('Vui lòng nhập mã ID 6 chữ số!');
      return;
    }
    if (!excelPendingWb) {
      setExcelModalError('Không tìm thấy dữ liệu file Excel.');
      return;
    }

    const trimmedCode = excelModalCode.trim().toUpperCase();
    const finalName = excelModalName.trim() || `Bộ đề ${trimmedCode}`;
    setLoading(true);
    setExcelModalError('');

    try {
      const parsedData = parseAndApplyExcel(excelPendingWb);
      // Construct payload directly using parsed values from Excel
      const payload: MatchDbModel = {
        matchCode: trimmedCode,
        matchName: finalName,
        matchPassword: excelModalPassword.trim() || '123',
        userId: currentUserState?.id,
        ownerEmail: currentUserState?.email,
        ownerName: currentUserState?.fullName,
        khoi_dong: parsedData?.khoi_dong || { cau_hoi: khoiDongQs },
        vuot_chuong_ngai_vat: parsedData?.vuot_chuong_ngai_vat || {
          tu_khoa_chinh: (vcnvWord || '').toUpperCase(),
          anh_goc_url: vcnvImage || '',
          so_hang_ngang: vcnvSoHN,
          hang_ngang: vcnvRows
        },
        tang_toc: parsedData?.tang_toc || { cau_hoi: tangTocQs, cai_tien_cau_hoi: tangTocCaiTienQs },
        ve_dich: parsedData?.ve_dich || { cau_hoi: veDichQs },
        cau_hoi_phu: parsedData?.cau_hoi_phu || { cau_hoi: cauHoiPhuQs },
        jeopardy: parsedData?.jeopardy || { boardSize: jeopardyBoardSize, categories: jeopardyCategories },
        ma_tran_kep: parsedData?.ma_tran_kep || { cau_hoi: maTranKepQs, dap_an_nhieu: dapAnNhieu },
        chinh_phuc: parsedData?.chinh_phuc || {
          de_cau_hoi: {
            de: chinhPhucDeQs,
            trung_binh: chinhPhucTrungBinhQs,
            kho: chinhPhucKhoQs
          },
          gmdt: gmdtQs
        },
        dau_tri: parsedData?.dau_tri || { cau_hoi: dauTriQs },
        media_ngoai: parsedData?.media_ngoai || mediaNgoai
      };

      const data = await safeFetchJson<any>('/api/match/save', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (data && data.success) {
        setMatchCode(trimmedCode);
        setMatchName(finalName);
        setMatchPassword(payload.matchPassword);
        saveLocalBackup(payload);
        setStatus({
          type: 'success',
          message: `Nạp thành công từ Excel và đã lưu bộ đề [${trimmedCode}] "${finalName}" vào tài khoản!`
        });

        // Optimistically insert / update matches list in sidebar
        const newMatchMeta = {
          matchCode: trimmedCode,
          matchName: finalName,
          matchPassword: payload.matchPassword,
          tu_khoa_chinh: payload.vuot_chuong_ngai_vat?.tu_khoa_chinh || '',
          userId: currentUserState?.id,
          ownerEmail: currentUserState?.email,
          ownerName: currentUserState?.fullName,
          updatedAt: new Date().toISOString()
        };
        setMatches(prev => {
          const exists = prev.some(m => m.matchCode.toLowerCase() === trimmedCode.toLowerCase());
          if (exists) {
            return prev.map(m => m.matchCode.toLowerCase() === trimmedCode.toLowerCase() ? { ...m, ...newMatchMeta } : m);
          } else {
            return [newMatchMeta, ...prev];
          }
        });

        fetchMatchesList();
        setShowExcelSaveModal(false);
        setExcelPendingWb(null);
      } else {
        setExcelModalError(data?.message || 'Lỗi khi lưu bộ đề lên hệ thống.');
      }
    } catch (err: any) {
      console.error(err);
      setExcelModalError('Lỗi xử lý file Excel hoặc kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const myMatchesCount = matches.length;

  const filteredMatches = matches.filter(m => {
    const matchesSearch = m.matchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tu_khoa_chinh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.matchName && m.matchName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.ownerName && m.ownerName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-4 md:p-6 flex flex-col font-sans">
      
      {/* Top Header Row */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
              <Database className="w-5 h-5 text-indigo-400" />
              Kho Đề Thi & Quản Lý Câu Hỏi
            </h1>
            <p className="text-xs text-slate-400">Tự động đồng bộ đề thi vào tài khoản máy chủ, hỗ trợ 6 số ngẫu nhiên & file Excel.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto">
          {/* User Account Status Indicator */}
          {currentUserState ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-indigo-500/30 rounded-xl text-xs text-slate-300">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">{currentUserState.fullName}</span>
              <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded">
                {currentUserState.email.split('@')[0]}
              </span>
            </div>
          ) : (
            onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                <span>Đăng Nhập Lưu Đề</span>
              </button>
            )
          )}

          {/* Sync Button */}
          <button
            onClick={syncOfflineMatches}
            disabled={isSyncing}
            title="Đồng bộ lại toàn bộ đề từ máy và tài khoản"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 border border-slate-700/50"
          >
            <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-bounce text-indigo-400' : 'text-slate-400'}`} />
          </button>

          <button
            onClick={handleCreateNewMatch}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-indigo-500/10 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            TẠO ĐỀ THI MỚI (MÃ NGẪU NHIÊN)
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Quay Lại Đạo Diễn
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Matches Library list & Import Actions (3 Cols, Hideable) */}
        <div className={`${isSidebarOpen ? 'lg:col-span-3' : 'hidden'} space-y-6 transition-all duration-300`}>
          
          {/* Matches List Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[540px]">
            <div className="mb-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    Kho Đề Của Bạn ({matches.length})
                  </h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {currentUserState ? `Bộ đề riêng của: ${currentUserState.email}` : 'Kho đề cá nhân'}
                  </p>
                </div>
                {isSyncing && (
                  <span className="text-[10px] text-indigo-400 flex items-center gap-1 font-mono">
                    <Cloud className="w-3 h-3 animate-spin" /> Đang đồng bộ...
                  </span>
                )}
              </div>
              
              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm mã đề hoặc từ khóa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-white"
                />
              </div>
            </div>

            {/* Scrollable list of match sets */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {!currentUserState ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-950/60 rounded-xl border border-indigo-500/20">
                  <Lock className="w-8 h-8 text-indigo-400 mb-2" />
                  <p className="text-xs font-bold text-slate-200">Kho đề riêng của từng tài khoản</p>
                  <p className="text-[11px] text-slate-400 mt-1 mb-3">
                    Đăng nhập để xem, chỉnh sửa và quản lý các bộ đề thi bảo mật của riêng bạn.
                  </p>
                  {onOpenAuthModal && (
                    <button
                      type="button"
                      onClick={onOpenAuthModal}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
                    >
                      <LogIn className="w-3.5 h-3.5" /> Đăng nhập ngay
                    </button>
                  )}
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                  <FileText className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-xs italic">
                    Bạn chưa có bộ đề nào trong tài khoản này.
                  </p>
                  <button
                    onClick={handleCreateNewMatch}
                    className="mt-3 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tạo đề ngẫu nhiên mới
                  </button>
                </div>
              ) : (
                filteredMatches.map((m) => {
                  const isActive = activeMatchCode === m.matchCode;
                  const isCurrentEditing = matchCode === m.matchCode;
                  const isOwnedByMe = m.isOwner || (currentUserState?.email && m.ownerEmail?.toLowerCase() === currentUserState.email.toLowerCase());

                  return (
                    <div 
                      key={m.matchCode}
                      onClick={() => loadMatchData(m.matchCode)}
                      className={`p-2.5 rounded-xl border transition-all text-left cursor-pointer group ${
                        isCurrentEditing 
                          ? 'bg-indigo-500/10 border-indigo-500/80 shadow-md shadow-indigo-500/5' 
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-black text-sm text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 group-hover:text-indigo-400 transition-colors">
                            {m.matchCode}
                          </span>
                          {isActive && (
                            <span className="text-[9px] font-black uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.2 rounded-full flex items-center gap-1 animate-pulse">
                              Active Live
                            </span>
                          )}
                          {m.matchCode === 'OLYMPIA26' ? (
                            <span className="text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.2 rounded">
                              Mặc định
                            </span>
                          ) : isOwnedByMe ? (
                            <span className="text-[9px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <UserCheck className="w-2.5 h-2.5" /> Của bạn
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleActivateMatch(m.matchCode)}
                            title="Kích hoạt nạp đề trực tiếp vào trận đấu đang chạy"
                            className="p-1 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded transition-all cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          {m.matchCode !== 'OLYMPIA26' && (
                            <button
                              onClick={() => handleDeleteMatch(m.matchCode)}
                              title="Xóa bộ đề này vĩnh viễn"
                              className="p-1 hover:bg-red-500/20 text-red-500 hover:text-red-400 rounded transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Mật khẩu: <span className="text-indigo-400 font-mono font-bold">{m.matchPassword || '123'}</span></span>
                        {m.ownerName && (
                          <span className="text-[10px] text-slate-500 truncate max-w-[100px]">
                            {m.ownerName}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Excel File Template & Importing card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 text-indigo-300">
              <Upload className="w-4 h-4 text-indigo-400" />
              Tích Hợp File Excel (.XLSX)
            </h2>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Hệ thống hiện đã hỗ trợ đầy đủ các trường <strong>Đường dẫn Media (URL)</strong> và <strong>Loại Media (image/audio/video)</strong> cho từng câu hỏi ở tất cả các vòng thi.
            </p>

            <button
              onClick={downloadExcelTemplate}
              title="Tải file mẫu Excel trống chuẩn cấu trúc chuyên nghiệp"
              className="w-full py-2 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-300 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Tải mẫu đề thi (.XLSX)
            </button>

            <div className="border border-dashed border-slate-800 rounded-xl p-3 bg-slate-950/40 text-center relative hover:border-slate-700 transition-all">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-1.5 py-1">
                <Upload className="w-5 h-5 text-indigo-400 animate-bounce" />
                <span className="text-[10px] font-bold text-slate-300">Nhấp Để Chọn Hoặc Thả File Excel</span>
                <span className="text-[8px] text-slate-500">Hỗ trợ định dạng .xlsx tiêu chuẩn</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Question Form Editor (9 or 12 Cols) */}
        <div className={`${isSidebarOpen ? 'lg:col-span-9' : 'lg:col-span-12'} bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6 transition-all duration-300`}>
          
          {/* Header info of selected match */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang chỉnh sửa bộ đề:</span>
                <span className="text-md font-mono font-black text-indigo-300 bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg">
                  {matchCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Hệ thống tự động đồng bộ hóa lên máy chủ dữ liệu khi bạn nhấn "Lưu".</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Pass Đề:</span>
                <input
                  type="text"
                  value={matchPassword}
                  onChange={(e) => setMatchPassword(e.target.value)}
                  className="bg-transparent text-xs text-white font-mono font-bold w-16 focus:outline-none focus:border-indigo-500 text-center"
                />
              </div>

              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all border border-slate-800 cursor-pointer flex items-center gap-1"
                title={isSidebarOpen ? "Ẩn danh sách bộ đề" : "Hiện danh sách bộ đề"}
              >
                {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className="text-[10px] font-bold uppercase hidden sm:inline">{isSidebarOpen ? "Ẩn kho đề" : "Hiện kho đề"}</span>
              </button>

              <button
                onClick={() => loadMatchData(matchCode)}
                title="Khôi phục lại thay đổi chưa lưu"
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all border border-slate-800 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={exportCurrentMatchExcel}
                title="Xuất bộ đề thi hiện tại ra file Excel (.xlsx) gồm đầy đủ Media và Chú thích"
                className="px-3.5 py-2 bg-indigo-600/90 hover:bg-indigo-550 active:scale-95 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/10 cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                XUẤT ĐỀ THI (.XLSX)
              </button>

              {lastAutoSaveTime && (
                <span className="text-[10px] text-emerald-400 font-mono font-medium hidden md:inline animate-pulse">
                  ✓ Tự động lưu: {lastAutoSaveTime}
                </span>
              )}

              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/15 cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                LƯU ĐỀ THI VÀO HỆ THỐNG
              </button>
            </div>
          </div>

          {/* Notifications banner inside editor */}
          {status.type && (
            <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
              status.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
                : status.type === 'error'
                ? 'bg-red-500/15 border-red-500/20 text-red-400'
                : 'bg-indigo-500/15 border-indigo-500/20 text-indigo-400'
            }`}>
              {status.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          {/* Tab Selection */}
          <div className="flex flex-wrap gap-1 border-b border-slate-800 pb-px">
            {([
              { id: 'KHOI_DONG', label: 'Khởi Động' },
              { id: 'VCNV', label: 'Vượt Chướng Ngại Vật' },
              { id: 'TANG_TOC', label: 'Tăng Tốc' },
              { id: 'VE_DICH', label: 'Về Đích' },
              { id: 'CH_PHU', label: 'Câu Hỏi Phụ' },
              { id: 'JEOPARDY', label: 'Jeopardy!' },
              { id: 'MA_TRAN_KEP', label: 'Ma Trận Kép' },
              { id: 'CHINH_PHUC', label: 'Chinh Phục & GMĐT' },
              { id: 'DAU_TRI', label: 'Đấu Trí' },
              { id: 'MEDIA', label: 'Media Ngoài' }
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeTab === t.id
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Form edit body views */}
          <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4 font-sans text-sm">
            {activeTab === 'KHOI_DONG' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold">
                        <th className="py-2 px-3 w-12 text-center">STT</th>
                        <th className="py-2 px-3 w-20">Lĩnh vực</th>
                        <th className="py-2 px-3">Câu hỏi</th>
                        <th className="py-2 px-3 w-40">Đáp án</th>
                        <th className="py-2 px-3">Giải thích</th>
                        <th className="py-2 px-3 w-16 text-center">Media</th>
                        <th className="py-2 px-3 w-20 text-center">Sửa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-xs">
                      {khoiDongQs.map((q, idx) => {
                        return (
                          <tr key={q.id} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-3 text-center font-bold text-slate-400 w-12">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 w-20">
                              <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-[10px] uppercase">
                                {normalizeLinhVuc(q.linh_vuc)}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 max-w-sm break-words text-slate-200">
                              {q.noi_dung || <span className="italic text-slate-600">(Trống)</span>}
                            </td>
                            <td className="py-2.5 px-3 w-40 break-words font-extrabold text-teal-400 uppercase">
                              {q.dap_an_dung || <span className="italic text-slate-600 font-normal">(Trống)</span>}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 italic">
                              {q.chu_thich || <span className="text-slate-700">-</span>}
                            </td>
                            <td className="py-2.5 px-3 w-16 text-center">
                              {q.media?.url ? (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase">
                                  {q.media.type === 'image' ? '🖼️ Ảnh' : q.media.type === 'audio' ? '🔊 Âm' : '🎥 Clip'}
                                </span>
                              ) : (
                                <span className="text-slate-600 text-xs">-</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 w-20 text-center">
                              <button
                                onClick={() => handleOpenEditModal('KHOI_DONG', q)}
                                className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 border border-slate-700 rounded transition-all flex items-center gap-1 mx-auto cursor-pointer font-bold text-[11px]"
                              >
                                <Pencil className="w-3 h-3" />
                                Sửa
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => handleOpenEditModal('KHOI_DONG')}
                    className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-300 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    THÊM CÂU HỎI MỚI
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'VCNV' && (
              <div className="space-y-6">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Từ Khóa Chính Chướng Ngại Vật</label>
                      <input
                        type="text"
                        value={vcnvWord}
                        onChange={(e) => setVcnvWord(e.target.value.toUpperCase())}
                        placeholder="VÍ DỤ: HỒ CHÍ MINH..."
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm font-extrabold text-teal-400 focus:outline-none focus:border-indigo-500 uppercase tracking-widest"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">Từ khóa chính người chơi cần giải đố cuối cùng.</span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Ảnh Nền Gốc URL (Để phân mảnh)</label>
                      <input
                        type="text"
                        value={vcnvImage}
                        onChange={(e) => setVcnvImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {vcnvSoHN === 8 ? 'Hình ảnh gốc sẽ chia thành lưới 8 mảnh (2x4) tương ứng 8 hàng ngang.' : 'Hình ảnh gốc sẽ chia thành 4 góc và 1 mảnh trung tâm.'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3">
                    <label className="text-xs font-bold text-slate-300">Phân loại CNV (Số Hàng Ngang):</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setVcnvSoHN(4);
                          const cur = [...vcnvRows];
                          while (cur.length < 5) {
                            cur.push({ id: cur.length + 1, cau_hoi: '', dap_an: '', so_ky_tu: 5 });
                          }
                          setVcnvRows(cur.slice(0, 5));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border ${
                          vcnvSoHN === 4 ? 'bg-indigo-600 border-indigo-400 text-white shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        4 Hàng Ngang (Mặc định)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVcnvSoHN(8);
                          const cur = [...vcnvRows];
                          while (cur.length < 8) {
                            cur.push({ id: cur.length + 1, cau_hoi: '', dap_an: '', so_ky_tu: 5 });
                          }
                          setVcnvRows(cur.slice(0, 8));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border ${
                          vcnvSoHN === 8 ? 'bg-indigo-600 border-indigo-400 text-white shadow-md' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        8 Hàng Ngang (CNV 2.0)
                      </button>
                    </div>
                  </div>
                </div>

                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{vcnvSoHN} Hàng Ngang Gợi Ý:</h3>
                <div className="space-y-4">
                  {vcnvRows.map((row, idx) => (
                    <div key={row.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-400 uppercase">Hàng ngang số {row.id} {row.id === 5 ? '(Trung Tâm)' : ''}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded font-mono">
                            {row.so_ky_tu || 0} ký tự (Tự động)
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">Row ID: {row.id}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        <div className="md:col-span-6">
                          <label className="text-[10px] text-slate-400 font-semibold block mb-1">Câu hỏi gợi ý</label>
                          <input
                            type="text"
                            value={row.cau_hoi}
                            onChange={(e) => updateVcnvRow(idx, 'cau_hoi', e.target.value)}
                            placeholder="Nhập câu hỏi..."
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="text-[10px] text-slate-400 font-semibold block mb-1">Đáp án đúng</label>
                          <input
                            type="text"
                            value={row.dap_an}
                            onChange={(e) => handleVcnvAnswerChange(idx, e.target.value)}
                            placeholder="ĐÁP ÁN..."
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs font-bold uppercase focus:outline-none focus:border-indigo-500 text-teal-400"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-[10px] text-slate-400 font-semibold block mb-1 text-center">Media</label>
                          <button
                            onClick={() => openMediaModal('VCNV', idx, row.media)}
                            className={`w-full py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              row.media?.url 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                            title={row.media?.url ? `Có media: ${row.media.type}` : "Gắn media cho câu hỏi"}
                          >
                            <Link className="w-3.5 h-3.5" />
                            {row.media?.url ? 'OK' : 'Media'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'TANG_TOC' && (
              <div className="space-y-4">
                <div className="flex gap-2 border-b border-slate-800 pb-3">
                  <button
                    onClick={() => setTangTocSubTab('TRADITIONAL')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                      tangTocSubTab === 'TRADITIONAL'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Tăng Tốc - Truyền Thống (4 Câu)
                  </button>
                  <button
                    onClick={() => setTangTocSubTab('IMPROVED')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                      tangTocSubTab === 'IMPROVED'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Tăng Tốc - Cải Tiến (Gợi Ý & Bấm Chuông)
                  </button>
                </div>

                {tangTocSubTab === 'TRADITIONAL' ? (
                  tangTocQs.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-400 uppercase">CÂU HỎI TĂNG TỐC SỐ {q.id}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Q_ID: {q.id}</span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block mb-1">Nội dung câu hỏi / Gợi ý</label>
                          <textarea
                            rows={2}
                            value={q.noi_dung}
                            onChange={(e) => updateTangTocQ(idx, 'noi_dung', e.target.value)}
                            placeholder="Nhập nội dung câu hỏi mô tả..."
                            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-semibold block mb-1">Giải thích đáp án / Gợi ý thêm</label>
                          <textarea
                            rows={1}
                            value={q.chu_thich || ''}
                            onChange={(e) => updateTangTocQ(idx, 'chu_thich', e.target.value)}
                            placeholder="Nhập giải thích cho đáp án đúng của câu hỏi Tăng tốc..."
                            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                          <div className="md:col-span-4">
                            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Đáp án đúng</label>
                            <input
                              type="text"
                              value={q.dap_an_dung}
                              onChange={(e) => updateTangTocQ(idx, 'dap_an_dung', e.target.value.toUpperCase())}
                              placeholder="ĐÁP ÁN..."
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs font-bold uppercase focus:outline-none focus:border-indigo-500 text-teal-400"
                            />
                          </div>

                          <div className="md:col-span-3">
                            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Thời gian đếm ngược</label>
                            <select
                              value={q.thoi_gian || 30}
                              onChange={(e) => updateTangTocQ(idx, 'thoi_gian', parseInt(e.target.value) as any)}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-bold"
                            >
                              <option value={10}>10 giây</option>
                              <option value={20}>20 giây</option>
                              <option value={30}>30 giây</option>
                              <option value={40}>40 giây</option>
                            </select>
                          </div>

                          <div className="md:col-span-2.5">
                            <label className="text-[10px] text-slate-400 font-semibold block mb-1 text-center">Media câu hỏi</label>
                            <button
                              onClick={() => openMediaModal('TANG_TOC_Q', idx, q.media)}
                              className={`w-full py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                q.media?.url 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                              }`}
                            >
                              <Link className="w-3.5 h-3.5" />
                              {q.media?.url ? 'Có Media Q' : 'Gắn Media Q'}
                            </button>
                          </div>

                          <div className="md:col-span-2.5">
                            <label className="text-[10px] text-slate-400 font-semibold block mb-1 text-center">Media đáp án</label>
                            <button
                              onClick={() => openMediaModal('TANG_TOC_A', idx, q.media_dap_an)}
                              className={`w-full py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                q.media_dap_an?.url 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                              }`}
                            >
                              <Link className="w-3.5 h-3.5" />
                              {q.media_dap_an?.url ? 'Có Media A' : 'Gắn Media A'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  tangTocCaiTienQs.map((q, qIdx) => (
                    <div key={q.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-black text-amber-400 uppercase">CÂU HỎI TĂNG TỐC CẢI TIẾN SỐ {q.id}</span>
                        <div className="flex items-center gap-3">
                          <label className="text-[10px] text-slate-400 font-semibold">Loại câu hỏi:</label>
                          <select
                            value={q.loai_cau_hoi}
                            onChange={(e) => {
                              const loai = parseInt(e.target.value) as 3 | 4;
                              setTangTocCaiTienQs(prev => {
                                const copy = [...prev];
                                const currentGoiY = [...copy[qIdx].goi_y];
                                if (loai === 4 && currentGoiY.length < 4) {
                                  currentGoiY.push({ stt: 4, noi_dung: '' });
                                } else if (loai === 3 && currentGoiY.length > 3) {
                                  currentGoiY.splice(3);
                                }
                                copy[qIdx] = { ...copy[qIdx], loai_cau_hoi: loai, goi_y: currentGoiY };
                                return copy;
                              });
                            }}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-bold"
                          >
                            <option value={3}>3 Gợi ý (30 Giây)</option>
                            <option value={4}>4 Gợi ý (40 Giây)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-8">
                          <label className="text-[10px] text-slate-400 font-semibold block mb-1">Nội dung câu hỏi tổng quát</label>
                          <input
                            type="text"
                            value={q.noi_dung}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTangTocCaiTienQs(prev => {
                                const copy = [...prev];
                                copy[qIdx] = { ...copy[qIdx], noi_dung: val };
                                return copy;
                              });
                            }}
                            placeholder="Nhập nội dung câu hỏi..."
                            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="md:col-span-4">
                          <label className="text-[10px] text-slate-400 font-semibold block mb-1">Đáp án đúng</label>
                          <input
                            type="text"
                            value={q.dap_an_dung}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              setTangTocCaiTienQs(prev => {
                                const copy = [...prev];
                                copy[qIdx] = { ...copy[qIdx], dap_an_dung: val };
                                return copy;
                              });
                            }}
                            placeholder="ĐÁP ÁN DÚNG..."
                            className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-bold uppercase text-teal-400 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Hints section */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/60">
                        <span className="text-[10px] text-indigo-400 uppercase font-bold block">Danh sách {q.loai_cau_hoi} gợi ý (Xuất hiện mỗi 10 giây):</span>
                        {q.goi_y.map((hint, hIdx) => (
                          <div key={hint.stt} className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                            <span className="w-6 h-6 bg-indigo-500/20 text-indigo-300 font-black text-xs rounded flex items-center justify-center shrink-0">
                              {hint.stt}
                            </span>
                            <input
                              type="text"
                              value={hint.noi_dung}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTangTocCaiTienQs(prev => {
                                  const copy = [...prev];
                                  const goiYCopy = [...copy[qIdx].goi_y];
                                  goiYCopy[hIdx] = { ...goiYCopy[hIdx], noi_dung: val };
                                  copy[qIdx] = { ...copy[qIdx], goi_y: goiYCopy };
                                  return copy;
                                });
                              }}
                              placeholder={`Nội dung gợi ý ${hint.stt} (${hint.stt * 10}s - ${40 - (hint.stt - 1) * 10}đ)...`}
                              className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'VE_DICH' && (
              <div className="space-y-8">
                {([10, 20, 30, 40] as const).map((pts, sectionIdx) => {
                  const sectionQs = veDichQs.filter(q => q.muc_diem === pts);
                  const colors = {
                    10: 'text-sky-400 border-sky-500/20 bg-sky-500/10 text-sky-300',
                    20: 'text-teal-400 border-teal-500/20 bg-teal-500/10 text-teal-300',
                    30: 'text-amber-400 border-amber-500/20 bg-amber-500/10 text-amber-300',
                    40: 'text-purple-400 border-purple-500/20 bg-purple-500/10 text-purple-300'
                  }[pts];

                  return (
                    <div key={pts} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className={`text-sm font-black uppercase tracking-wider ${colors.split(' ')[0]}`}>
                          Mục {sectionIdx + 1}: Gói Câu Hỏi {pts} Điểm
                        </h3>
                        <span className="text-xs text-slate-500 font-bold">
                          Tổng số: {sectionQs.length} câu
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold">
                              <th className="py-2 px-3 w-12 text-center">STT</th>
                              <th className="py-2 px-3 w-20">Lĩnh vực</th>
                              <th className="py-2 px-3">Câu hỏi</th>
                              <th className="py-2 px-3 w-40">Đáp án</th>
                              <th className="py-2 px-3">Giải thích</th>
                              <th className="py-2 px-3 w-16 text-center">Media</th>
                              <th className="py-2 px-3 w-20 text-center">Sửa</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 text-xs">
                            {sectionQs.map((q, subIdx) => (
                              <tr key={q.id} className="hover:bg-slate-900/40">
                                <td className="py-2.5 px-3 text-center font-bold text-slate-400 w-12">
                                  {subIdx + 1}
                                </td>
                                <td className="py-2.5 px-3 w-20">
                                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-[10px] uppercase">
                                    {normalizeLinhVuc(q.linh_vuc)}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 max-w-sm break-words text-slate-200">
                                  {q.noi_dung || <span className="italic text-slate-600">(Trống)</span>}
                                </td>
                                <td className="py-2.5 px-3 w-40 break-words font-extrabold text-teal-400 uppercase">
                                  {q.dap_an_dung || <span className="italic text-slate-600 font-normal">(Trống)</span>}
                                </td>
                                <td className="py-2.5 px-3 text-slate-400 italic">
                                  {q.chu_thich || <span className="text-slate-700">-</span>}
                                </td>
                                <td className="py-2.5 px-3 w-16 text-center">
                                  {q.media?.url ? (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase">
                                      {q.media.type === 'image' ? '🖼️ Ảnh' : q.media.type === 'audio' ? '🔊 Âm' : '🎥 Clip'}
                                    </span>
                                  ) : (
                                    <span className="text-slate-600 text-xs">-</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 w-20 text-center">
                                  <button
                                    onClick={() => handleOpenEditModal('VE_DICH', q)}
                                    className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 border border-slate-700 rounded transition-all flex items-center gap-1 mx-auto cursor-pointer font-bold text-[11px]"
                                  >
                                    <Pencil className="w-3 h-3" />
                                    Sửa
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {sectionQs.length === 0 && (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                                  Chưa có câu hỏi {pts} điểm nào.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-center pt-2">
                        <button
                          onClick={() => handleOpenEditModal('VE_DICH', undefined, pts)}
                          className={`px-4 py-2 border hover:bg-opacity-20 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${colors}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          THÊM CÂU HỎI {pts} ĐIỂM MỚI
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'CH_PHU' && (
              <div className="space-y-4">
                {cauHoiPhuQs.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-400 uppercase">Câu hỏi phụ số {q.id}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Q_ID: {q.id}</span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-1">Nội dung câu hỏi phụ nhanh</label>
                        <textarea
                          rows={2}
                          value={q.noi_dung}
                          onChange={(e) => updateCauHoiPhuQ(idx, 'noi_dung', e.target.value)}
                          placeholder="Nhập nội dung câu hỏi phụ phân định thắng thua..."
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-1">Đáp án đúng</label>
                        <input
                          type="text"
                          value={q.dap_an_dung}
                          onChange={(e) => updateCauHoiPhuQ(idx, 'dap_an_dung', e.target.value.toUpperCase())}
                          placeholder="ĐÁP ÁN..."
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs font-bold uppercase focus:outline-none focus:border-indigo-500 text-teal-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'JEOPARDY' && (
              <div className="space-y-6 font-sans">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                      CẤU HÌNH & QUẢN LÝ KHO ĐỀ JEOPARDY!
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Chỉnh sửa tiêu đề chủ đề và các gợi ý theo từng mức điểm.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Bảng:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setJeopardyBoardSize('5x4');
                        setJeopardyCategories(createDefaultCategories('5x4'));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        jeopardyBoardSize === '5x4'
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      5x4 (5 chủ đề)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setJeopardyBoardSize('6x5');
                        setJeopardyCategories(createDefaultCategories('6x5'));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        jeopardyBoardSize === '6x5'
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      6x5 (6 chủ đề)
                    </button>
                  </div>
                </div>

                {/* Categories & Clues Form Matrix */}
                <div className={`grid gap-4 ${jeopardyBoardSize === '6x5' ? 'grid-cols-6' : 'grid-cols-5'}`}>
                  {jeopardyCategories.map((cat, cIdx) => (
                    <div key={cIdx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-amber-400 font-bold uppercase block">Chủ đề {cIdx + 1}:</label>
                        <input
                          type="text"
                          value={cat.title}
                          onChange={(e) => {
                            const newCat = [...jeopardyCategories];
                            newCat[cIdx].title = e.target.value;
                            setJeopardyCategories(newCat);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="space-y-3 pt-2 border-t border-slate-900">
                        {cat.clues.map((clue: any, kIdx: number) => (
                          <div key={kIdx} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-bold">Ô {kIdx + 1}</span>
                              <input
                                type="number"
                                value={clue.points}
                                onChange={(e) => {
                                  const newCat = [...jeopardyCategories];
                                  newCat[cIdx].clues[kIdx].points = Number(e.target.value);
                                  setJeopardyCategories(newCat);
                                }}
                                className="w-16 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-amber-300 text-center"
                              />
                            </div>

                            <textarea
                              rows={2}
                              value={clue.question}
                              onChange={(e) => {
                                const newCat = [...jeopardyCategories];
                                newCat[cIdx].clues[kIdx].question = e.target.value;
                                setJeopardyCategories(newCat);
                              }}
                              placeholder="Nội dung câu hỏi / gợi ý..."
                              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 resize-none"
                            />

                            <input
                              type="text"
                              value={clue.dap_an_dung}
                              onChange={(e) => {
                                const newCat = [...jeopardyCategories];
                                newCat[cIdx].clues[kIdx].dap_an_dung = e.target.value.toUpperCase();
                                setJeopardyCategories(newCat);
                              }}
                              placeholder="Đáp án đúng..."
                              className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[11px] font-bold text-emerald-400 uppercase focus:outline-none focus:border-emerald-500"
                            />

                            <div className="grid grid-cols-3 gap-1 pt-1">
                              <input
                                type="text"
                                value={clue.media?.url || ''}
                                onChange={(e) => {
                                  const newCat = [...jeopardyCategories];
                                  const url = e.target.value;
                                  const type = newCat[cIdx].clues[kIdx].media?.type || 'image';
                                  newCat[cIdx].clues[kIdx].media = url ? { url, type } : undefined;
                                  setJeopardyCategories(newCat);
                                }}
                                placeholder="Link Media..."
                                className="col-span-2 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[10px] text-sky-300 focus:outline-none focus:border-sky-500"
                              />
                              <select
                                value={clue.media?.type || 'image'}
                                onChange={(e) => {
                                  const newCat = [...jeopardyCategories];
                                  const url = newCat[cIdx].clues[kIdx].media?.url || '';
                                  const type = e.target.value as 'image' | 'video' | 'audio';
                                  newCat[cIdx].clues[kIdx].media = url ? { url, type } : undefined;
                                  setJeopardyCategories(newCat);
                                }}
                                className="bg-slate-950 border border-slate-800 rounded px-1 py-1 text-[10px] font-bold text-slate-300 focus:outline-none focus:border-sky-500"
                              >
                                <option value="image">Ảnh</option>
                                <option value="video">Video</option>
                                <option value="audio">Audio</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'MA_TRAN_KEP' && (
              <div className="space-y-6 font-sans">
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
                      CẤU HÌNH & QUẢN LÝ KHO ĐỀ MA TRẬN KÉP (12 CÂU HỎI)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Mỗi câu hỏi bao gồm 2 đáp án chính xác. Khi thí sinh chọn đúng 2 đáp án này trong bảng 4x3, câu hỏi được giải thành công.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const defaultQs: MaTranKepQuestion[] = [
                          { id: 1, noi_dung: 'Sông lớn chảy qua Việt Nam', dap_an_1: 'SÔNG HỒNG', dap_an_2: 'SÔNG MÊ KÔNG' },
                          { id: 2, noi_dung: 'Thành phố trực thuộc trung ương ở Việt Nam', dap_an_1: 'HÀ NỘI', dap_an_2: 'CẦN THƠ' },
                          { id: 3, noi_dung: 'Nhà văn Việt Nam đạt giải thưởng Hồ Chí Minh', dap_an_1: 'TÔ HOÀI', dap_an_2: 'NAM CAO' },
                          { id: 4, noi_dung: 'Đại dương trên Trái Đất', dap_an_1: 'THÁI BÌNH DƯƠNG', dap_an_2: 'ẤN ĐỘ DƯƠNG' },
                          { id: 5, noi_dung: 'Nguyên tố hoá học nhóm khí hiếm', dap_an_1: 'HELI', dap_an_2: 'NEON' },
                          { id: 6, noi_dung: 'Số nguyên tố nhỏ hơn 10', dap_an_1: '2', dap_an_2: '7' },
                          { id: 7, noi_dung: 'Tỉnh thành thuộc vùng Tây Nguyên', dap_an_1: 'LÂM ĐỒNG', dap_an_2: 'GIA LAI' },
                          { id: 8, noi_dung: 'Thủ đô các nước Đông Nam Á', dap_an_1: 'BANGKOK', dap_an_2: 'JAKARTA' },
                          { id: 9, noi_dung: 'Nhạc sĩ sáng tác nhạc cách mạng Việt Nam', dap_an_1: 'VĂN CAO', dap_an_2: 'ĐỖ NHUẬN' },
                          { id: 10, noi_dung: 'Hành tinh trong Hệ Mặt Trời có vành đai', dap_an_1: 'THỔ TINH', dap_an_2: 'THIÊN VƯƠNG TINH' },
                          { id: 11, noi_dung: 'Cầu thủ bóng đá đạt Quả bóng vàng Việt Nam', dap_an_1: 'QUANG HẢI', dap_an_2: 'CÔNG PHƯỢNG' },
                          { id: 12, noi_dung: 'Bào quan có trong tế bào thực vật', dap_an_1: 'LỤC THỂ', dap_an_2: 'TY THỂ' },
                        ];
                        setMaTranKepQs(defaultQs);
                      }}
                      className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Tạo 12 câu mẫu
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const newQ: MaTranKepQuestion = {
                          id: maTranKepQs.length + 1,
                          noi_dung: '',
                          dap_an_1: '',
                          dap_an_2: ''
                        };
                        setMaTranKepQs([...maTranKepQs, newQ]);
                      }}
                      className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm câu hỏi
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {maTranKepQs.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-500 text-xs italic">
                      Chưa có câu hỏi Ma Trận Kép nào. Nhấn "Tạo 12 câu mẫu" hoặc nạp từ file Excel.
                    </div>
                  ) : (
                    maTranKepQs.map((q, idx) => (
                      <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-500/30">
                          {idx + 1}
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                          <div className="md:col-span-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nội dung câu hỏi {idx + 1}</label>
                            <input
                              type="text"
                              value={q.noi_dung}
                              onChange={(e) => {
                                const newArr = [...maTranKepQs];
                                newArr[idx].noi_dung = e.target.value;
                                setMaTranKepQs(newArr);
                              }}
                              placeholder="Nhập nội dung câu hỏi..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-emerald-400 uppercase mb-1 block">Đáp án 1</label>
                            <input
                              type="text"
                              value={q.dap_an_1}
                              onChange={(e) => {
                                const newArr = [...maTranKepQs];
                                newArr[idx].dap_an_1 = e.target.value.toUpperCase();
                                setMaTranKepQs(newArr);
                              }}
                              placeholder="Đáp án 1..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-bold text-emerald-400 uppercase focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-emerald-400 uppercase mb-1 block">Đáp án 2</label>
                            <input
                              type="text"
                              value={q.dap_an_2}
                              onChange={(e) => {
                                const newArr = [...maTranKepQs];
                                newArr[idx].dap_an_2 = e.target.value.toUpperCase();
                                setMaTranKepQs(newArr);
                              }}
                              placeholder="Đáp án 2..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-bold text-emerald-400 uppercase focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setMaTranKepQs(maTranKepQs.filter((_, i) => i !== idx));
                          }}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition cursor-pointer shrink-0"
                          title="Xoá câu hỏi này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Section for 24 Distractors */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        DANH SÁCH ĐÁP ÁN GÂY NHIỄU (TỐI ĐA 24 ĐÁP ÁN)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Các đáp án này sẽ được hệ thống xáo trộn ngẫu nhiên để lấp đầy bảng 4x3 (12 ô) trong suốt các câu hỏi.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                    {Array.from({ length: 24 }).map((_, dIdx) => {
                      const val = dapAnNhieu[dIdx] || '';
                      return (
                        <div key={dIdx} className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] font-mono text-amber-400 w-5 text-center font-bold">N{dIdx + 1}</span>
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => {
                              const newD = [...dapAnNhieu];
                              while (newD.length <= dIdx) newD.push('');
                              newD[dIdx] = e.target.value.toUpperCase();
                              setDapAnNhieu(newD);
                            }}
                            placeholder={`Đáp án nhiễu ${dIdx + 1}`}
                            className="w-full bg-transparent text-xs font-bold text-amber-200 uppercase focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'CHINH_PHUC' && (
              <div className="space-y-6">
                {/* 1. GMDT Section on Top */}
                <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-cyan-400 uppercase tracking-wide flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Minigame Giải Mã Điện Thoại (GMĐT)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tách biệt ở trên cùng. Đáp án cuối được hệ thống tự động chuyển thành viết liền không dấu & mã hóa T9.
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const gmdtItem = gmdtQs[0] || { goi_y: '', dap_an_dung: '', mat_ma: '' };
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                        <div className="md:col-span-5 space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Gợi Ý GMĐT</label>
                          <input
                            type="text"
                            value={gmdtItem.goi_y}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = [...gmdtQs];
                              if (updated.length === 0) updated.push({ goi_y: '', dap_an_dung: '', mat_ma: '' });
                              updated[0].goi_y = val;
                              setGmdtQs(updated);
                            }}
                            placeholder="Nhập nội dung gợi ý..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div className="md:col-span-4 space-y-1.5">
                          <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Đáp Án Cuối GMĐT</label>
                          <input
                            type="text"
                            value={gmdtItem.dap_an_dung}
                            onChange={(e) => {
                              const rawVal = e.target.value;
                              const { cleanAnswer, matMa } = textToGmdtMatMa(rawVal);
                              const updated = [...gmdtQs];
                              if (updated.length === 0) updated.push({ goi_y: '', dap_an_dung: '', mat_ma: '' });
                              updated[0].dap_an_dung = cleanAnswer;
                              updated[0].mat_ma = matMa;
                              setGmdtQs(updated);
                            }}
                            placeholder="Nhập đáp án (VD: OLYMPIA)..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs font-mono font-bold text-amber-300 uppercase focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="md:col-span-3 space-y-1.5">
                          <label className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">Mật Mã T9 (Tự động)</label>
                          <div className="bg-slate-900 border border-cyan-500/30 rounded-lg p-2.5 text-xs font-mono font-black text-cyan-300 tracking-widest text-center">
                            {gmdtItem.mat_ma || 'CHƯA CÓ'}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. Chinh Phục Questions Section Below */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-amber-400 uppercase tracking-wide flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Danh Sách Câu Hỏi Vòng Chinh Phục (Tối Đa 90 Câu)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Phân chia theo thứ tự: Dễ (30 câu) → Trung bình (30 câu) → Khó (30 câu)
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(chinhPhucTier === 'de' ? 'CHINH_PHUC_DE' : chinhPhucTier === 'trung_binh' ? 'CHINH_PHUC_TB' : 'CHINH_PHUC_KHO')}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm Câu Hỏi Chinh Phục
                    </button>
                  </div>

                  {/* Level Filter Tabs */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Mức độ:</span>
                    {(['de', 'trung_binh', 'kho'] as const).map((tier) => {
                      const count = tier === 'de' ? chinhPhucDeQs.length : tier === 'trung_binh' ? chinhPhucTrungBinhQs.length : chinhPhucKhoQs.length;
                      const labels = { de: 'Dễ (10đ)', trung_binh: 'Trung Bình (20đ)', kho: 'Khó (30đ)' };
                      const colors = { de: 'text-emerald-400', trung_binh: 'text-amber-400', kho: 'text-rose-400' };
                      return (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setChinhPhucTier(tier)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-2 ${
                            chinhPhucTier === tier
                              ? 'bg-slate-800 border-slate-700 text-white shadow-md'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className={colors[tier]}>{labels[tier]}</span>
                          <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full font-mono text-slate-300">
                            {count}/30
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Question Table */}
                  <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                          <th className="p-3 w-12 text-center">STT</th>
                          <th className="p-3">Nội Dung Câu Hỏi</th>
                          <th className="p-3 w-40">Đáp Án Đúng</th>
                          <th className="p-3 w-40">Chú Thích / Giải Thích</th>
                          <th className="p-3 w-24 text-center">Media</th>
                          <th className="p-3 w-28 text-center">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {(() => {
                          const currentQs = chinhPhucTier === 'de' ? chinhPhucDeQs : chinhPhucTier === 'trung_binh' ? chinhPhucTrungBinhQs : chinhPhucKhoQs;
                          if (currentQs.length === 0) {
                            return (
                              <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                                  Chưa có câu hỏi nào cho mức độ này. Nhấn "Thêm Câu Hỏi Chinh Phục" để tạo mới.
                                </td>
                              </tr>
                            );
                          }
                          return currentQs.map((q, idx) => (
                            <tr key={q.id || idx} className="hover:bg-slate-900/40 transition">
                              <td className="p-3 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                              <td className="p-3 font-medium text-slate-200">{q.noi_dung || <span className="text-slate-600 italic">Trống</span>}</td>
                              <td className="p-3 font-mono font-bold text-amber-300">{q.dap_an_dung || '-'}</td>
                              <td className="p-3 text-slate-400 text-[11px]">{q.chu_thich || '-'}</td>
                              <td className="p-3 text-center">
                                {q.media?.url ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    {q.media.type || 'Media'}
                                  </span>
                                ) : (
                                  <span className="text-slate-600 font-mono text-[10px]">-</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(chinhPhucTier === 'de' ? 'CHINH_PHUC_DE' : chinhPhucTier === 'trung_binh' ? 'CHINH_PHUC_TB' : 'CHINH_PHUC_KHO', q)}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
                                    title="Sửa"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
                                        if (chinhPhucTier === 'de') setChinhPhucDeQs(prev => prev.filter(item => item.id !== q.id));
                                        else if (chinhPhucTier === 'trung_binh') setChinhPhucTrungBinhQs(prev => prev.filter(item => item.id !== q.id));
                                        else if (chinhPhucTier === 'kho') setChinhPhucKhoQs(prev => prev.filter(item => item.id !== q.id));
                                      }
                                    }}
                                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition cursor-pointer"
                                    title="Xoá"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'DAU_TRI' && (
              <div className="space-y-4">
                {/* Header overview card */}
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <Brain className="w-4 h-4 text-amber-400" />
                      Vòng 4: Đấu Trí (University Challenge Format)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Gồm <b>25 câu hỏi chính</b> (bấm chuông, 10 điểm) và <b>25 gói câu hỏi thưởng</b> tương ứng (mỗi gói 3 câu x 10 điểm, trả lời trong 10s).
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Bạn có muốn tạo dữ liệu 25 câu hỏi Đấu Trí mẫu chuẩn kiến thức đa lĩnh vực?')) {
                          // Sample generator
                          const templateSamples = [
                            { q: "Đại dương nào có diện tích và độ sâu trung bình lớn nhất trên Trái Đất?", a: "THÁI BÌNH DƯƠNG", exp: "Chiếm hơn 1/3 diện tích bề mặt Trái Đất.", topic: "Địa lý & Đại dương", b: [
                              { q: "Điểm sâu nhất của rãnh Mariana nằm ở đại dương nào?", a: "THÁI BÌNH DƯƠNG", exp: "Vực thẳm Challenger sâu gần 11.000m." },
                              { q: "Đại dương nào nhỏ nhất và có nhiệt độ bề mặt lạnh nhất?", a: "BẮC BĂNG DƯƠNG", exp: "Nằm hoàn toàn ở vùng cực Bắc." },
                              { q: "Biển Baltic thông trực tiếp với đại dương nào?", a: "ĐẠI TÂY DƯƠNG", exp: "Thông qua các eo biển Đan Mạch." }
                            ]},
                            { q: "Số nguyên tố chẵn duy nhất trong tập hợp các số tự nhiên là số nào?", a: "2", exp: "Mọi số chẵn lớn hơn 2 đều chia hết cho 2 nên là hợp số.", topic: "Toán học & Số học", b: [
                              { q: "Số nguyên tố nhỏ nhất có 2 chữ số là số nào?", a: "11", exp: "Các số nhỏ hơn: 10 chia hết cho 2 và 5." },
                              { q: "Có bao nhiêu số nguyên tố nhỏ hơn 20?", a: "8", exp: "Gồm 2, 3, 5, 7, 11, 13, 17, 19." },
                              { q: "Tổng của ba số nguyên tố đầu tiên bằng bao nhiêu?", a: "10", exp: "2 + 3 + 5 = 10." }
                            ]},
                            { q: "Chiến dịch Điện Biên Phủ toàn thắng vào ngày tháng năm nào?", a: "07/05/1954", exp: "Lừng lẫy năm châu, chấn động địa cầu.", topic: "Lịch sử Việt Nam thế kỷ XX", b: [
                              { q: "Ai là Tổng tư lệnh trực tiếp chỉ huy chiến dịch Điện Biên Phủ?", a: "VÕ NGUYÊN GIÁP", exp: "Đại tướng Võ Nguyên Giáp." },
                              { q: "Chiến dịch Điện Biên Phủ diễn ra trong bao nhiêu ngày đêm?", a: "56", exp: "56 ngày đêm khoét núi, ngủ hầm, mưa dầm, cơm vắt." },
                              { q: "Tên tướng chỉ huy tập đoàn cứ điểm Điện Biên Phủ bị bắt sống?", a: "ĐỜ CÁT", exp: "Tướng Christian de Castries." }
                            ]},
                            { q: "Kim loại nào có ký hiệu hóa học là 'Au' trong bảng tuần hoàn Mendeleev?", a: "VÀNG", exp: "Xuất phát từ tiếng Latinh Aurum.", topic: "Hóa học & Kim loại", b: [
                              { q: "Kim loại nào có tính dẫn điện và dẫn nhiệt tốt nhất ở điều kiện thường?", a: "BẠC", exp: "Thứ tự dẫn điện: Ag > Cu > Au > Al > Fe." },
                              { q: "Kim loại duy nhất ở thể lỏng ở nhiệt độ phòng là gì?", a: "THỦY NGÂN", exp: "Ký hiệu Hg, nhiệt độ nóng chảy -38.83°C." },
                              { q: "Kim loại nào có nhiệt độ nóng chảy cao nhất (~3422°C)?", a: "VONFRAM", exp: "Dùng làm dây tóc bóng đèn sợi đốt." }
                            ]},
                            { q: "Tác phẩm 'Truyện Kiều' bất hủ do đại thi hào nào sáng tác?", a: "NGUYỄN DU", exp: "Tên chữ Tố Như, hiệu Thanh Hiên.", topic: "Văn học Trung đại Việt Nam", b: [
                              { q: "Truyện Kiều được viết theo thể thơ truyền thống nào của dân tộc?", a: "LỤC BÁT", exp: "Gồm 3.254 câu thơ lục bát." },
                              { q: "Tên họ đầy đủ của nhân vật Thúy Kiều trong tác phẩm là gì?", a: "VƯƠNG THÚY KIỀU", exp: "Gia đình họ Vương." },
                              { q: "Mối tình đầu tha thiết của Thúy Kiều là chàng thư sinh nào?", a: "KIM TRỌNG", exp: "Vào tiết Thanh minh." }
                            ]}
                          ];

                          const filled: DauTriQuestion[] = Array.from({ length: 25 }, (_, i) => {
                            const sample = templateSamples[i % templateSamples.length];
                            return {
                              id: i + 1,
                              noi_dung: sample.q + (i >= templateSamples.length ? ` (Bộ ${Math.floor(i / templateSamples.length) + 1})` : ''),
                              dap_an_dung: sample.a,
                              chu_thich: sample.exp,
                              goi_thuong: {
                                chu_de: sample.topic + (i >= templateSamples.length ? ` - Phần ${Math.floor(i / templateSamples.length) + 1}` : ''),
                                cau_hoi: sample.b.map((item, bIdx) => ({
                                  id: `${i + 1}_${bIdx + 1}`,
                                  noi_dung: item.q,
                                  dap_an_dung: item.a,
                                  chu_thich: item.exp
                                }))
                              }
                            };
                          });
                          setDauTriQs(filled);
                          setStatus({ type: 'success', message: 'Đã nạp thành công 25 câu hỏi Đấu Trí mẫu chuẩn!' });
                        }
                      }}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Nạp 25 Câu Mẫu Chuẩn
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ nội dung 25 câu hỏi Đấu Trí để nhập lại từ đầu?')) {
                          setDauTriQs(createDefaultDauTriQs());
                          setStatus({ type: 'info', message: 'Đã làm trống 25 câu hỏi Đấu Trí.' });
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xóa Trắng
                    </button>
                  </div>
                </div>

                {/* Progress & Stats Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/40 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-400">Tiến độ hoàn thiện:</span>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg">
                      {dauTriQs.filter(q => q.noi_dung.trim().length > 0 && q.dap_an_dung.trim().length > 0).length}/25 câu chính
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg">
                      {dauTriQs.filter(q => q.goi_thuong?.cau_hoi?.some(b => b.noi_dung.trim().length > 0)).length}/25 gói thưởng
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm nội dung/đáp án..."
                        value={dauTriSearchQuery}
                        onChange={(e) => setDauTriSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Question Grid Selector 1..25 */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wide">
                    Chọn Số Câu Hỏi Để Soạn Thảo (1 - 25):
                  </label>
                  <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-25 gap-1.5">
                    {Array.from({ length: 25 }, (_, i) => {
                      const q = dauTriQs[i];
                      const isMainFilled = q && q.noi_dung.trim().length > 0 && q.dap_an_dung.trim().length > 0;
                      const isBonusFilled = q && q.goi_thuong && q.goi_thuong.cau_hoi && q.goi_thuong.cau_hoi.filter(b => b.noi_dung.trim().length > 0).length === 3;
                      const isSelected = dauTriActiveIndex === i;

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setDauTriActiveIndex(i)}
                          className={`relative p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[48px] ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md ring-2 ring-amber-500/30'
                              : isMainFilled && isBonusFilled
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                              : isMainFilled
                              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                          }`}
                        >
                          <span className="font-mono font-bold text-xs">#{i + 1}</span>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${isMainFilled ? 'bg-emerald-400' : 'bg-slate-700'}`} title="Câu chính" />
                            <span className={`w-1.5 h-1.5 rounded-full ${isBonusFilled ? 'bg-indigo-400' : 'bg-slate-700'}`} title="Gói thưởng (3 câu)" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Question Editor Card */}
                {(() => {
                  const currentQ = dauTriQs[dauTriActiveIndex] || {
                    id: dauTriActiveIndex + 1,
                    noi_dung: '',
                    dap_an_dung: '',
                    chu_thich: '',
                    goi_thuong: {
                      chu_de: `Chủ đề thưởng ${dauTriActiveIndex + 1}`,
                      cau_hoi: [
                        { id: `${dauTriActiveIndex + 1}_1`, noi_dung: '', dap_an_dung: '', chu_thich: '' },
                        { id: `${dauTriActiveIndex + 1}_2`, noi_dung: '', dap_an_dung: '', chu_thich: '' },
                        { id: `${dauTriActiveIndex + 1}_3`, noi_dung: '', dap_an_dung: '', chu_thich: '' }
                      ]
                    }
                  };

                  const updateCurrentQ = (updater: (prev: DauTriQuestion) => DauTriQuestion) => {
                    setDauTriQs(prev => {
                      const next = [...prev];
                      while (next.length < 25) {
                        next.push(createDefaultDauTriQs()[next.length]);
                      }
                      next[dauTriActiveIndex] = updater(next[dauTriActiveIndex] || currentQ);
                      return next;
                    });
                  };

                  return (
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-6 shadow-2xl">
                      {/* Top Header for current question */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-black flex items-center justify-center text-sm shadow-inner">
                            #{dauTriActiveIndex + 1}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                              Câu Hỏi Đấu Trí Số {dauTriActiveIndex + 1} / 25
                            </h4>
                            <span className="text-[11px] text-slate-400">
                              Câu hỏi chính (10 điểm) + Gói 3 câu hỏi thưởng liên kết
                            </span>
                          </div>
                        </div>

                        {/* Prev / Next navigation */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            disabled={dauTriActiveIndex === 0}
                            onClick={() => setDauTriActiveIndex(prev => Math.max(0, prev - 1))}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 font-bold text-xs rounded-xl transition border border-slate-800 cursor-pointer flex items-center gap-1"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Câu trước
                          </button>
                          <button
                            type="button"
                            disabled={dauTriActiveIndex === 24}
                            onClick={() => setDauTriActiveIndex(prev => Math.min(24, prev + 1))}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 font-bold text-xs rounded-xl transition border border-slate-800 cursor-pointer flex items-center gap-1"
                          >
                            Câu sau
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* SECTION 1: CÂU HỎI CHÍNH */}
                      <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-xs font-black text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                            ⭐ Phần 1: Câu Hỏi Chính (Bấm Chuông – 10 Điểm)
                          </span>
                          <span className="text-[10px] text-amber-400/80 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Thí sinh bấm chuông giành quyền
                          </span>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Nội Dung Câu Hỏi Chính</label>
                          <textarea
                            rows={3}
                            placeholder="Nhập nội dung câu hỏi chính chi tiết..."
                            value={currentQ.noi_dung}
                            onChange={(e) => updateCurrentQ(q => ({ ...q, noi_dung: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-white resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Đáp Án Đúng</label>
                            <input
                              type="text"
                              placeholder="Nhập đáp án đúng..."
                              value={currentQ.dap_an_dung}
                              onChange={(e) => updateCurrentQ(q => ({ ...q, dap_an_dung: e.target.value.toUpperCase() }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-amber-400 font-bold uppercase"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Giải Thích / Chú Thích</label>
                            <input
                              type="text"
                              placeholder="Giải thích thêm cho câu hỏi hoặc đáp án..."
                              value={currentQ.chu_thich || ''}
                              onChange={(e) => updateCurrentQ(q => ({ ...q, chu_thich: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-300"
                            />
                          </div>
                        </div>

                        {/* Media đính kèm cho câu chính */}
                        <div className="border-t border-slate-800/80 pt-3">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                            <div className="md:col-span-8">
                              <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Đường dẫn Media Câu Chính (Tùy chọn)</label>
                              <input
                                type="text"
                                placeholder="https://example.com/image.jpg hoặc video/audio..."
                                value={currentQ.media?.url || ''}
                                onChange={(e) => {
                                  const url = e.target.value.trim();
                                  let type = currentQ.media?.type || 'image';
                                  if (url.match(/\.(mp3|wav|ogg|m4a)($|\?)/i)) type = 'audio';
                                  else if (url.match(/\.(mp4|webm|mov)($|\?)/i) || url.includes('youtube.com') || url.includes('youtu.be')) type = 'video';
                                  updateCurrentQ(q => ({
                                    ...q,
                                    media: url ? { url, type } : undefined
                                  }));
                                }}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-white font-mono"
                              />
                            </div>
                            <div className="md:col-span-4">
                              <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Loại Media</label>
                              <select
                                value={currentQ.media?.type || 'image'}
                                onChange={(e) => {
                                  const type = e.target.value as any;
                                  if (currentQ.media?.url) {
                                    updateCurrentQ(q => ({
                                      ...q,
                                      media: { url: q.media!.url, type }
                                    }));
                                  }
                                }}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-white font-bold"
                              >
                                <option value="image">🖼️ Hình Ảnh (PNG/JPG)</option>
                                <option value="video">🎥 Video (MP4/YouTube)</option>
                                <option value="audio">🔊 Âm Thanh (MP3)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 2: GÓI CÂU HỎI THƯỞNG */}
                      <div className="bg-slate-900/60 border border-indigo-500/20 rounded-xl p-4 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                          <span className="text-xs font-black text-indigo-400 uppercase tracking-wide flex items-center gap-1.5">
                            🎁 Phần 2: Gói Câu Hỏi Thưởng Liên Kết (3 Câu x 10 Điểm)
                          </span>
                          <span className="text-[10px] text-indigo-300 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            10 giây đếm ngược / câu
                          </span>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Tên Chủ Đề Gói Thưởng</label>
                          <input
                            type="text"
                            placeholder="Nhập tên chủ đề gói thưởng (VD: Địa lý Việt Nam, Danh họa Phục Hưng...)"
                            value={currentQ.goi_thuong?.chu_de || ''}
                            onChange={(e) => updateCurrentQ(q => ({
                              ...q,
                              goi_thuong: {
                                ...q.goi_thuong,
                                chu_de: e.target.value,
                                cau_hoi: q.goi_thuong?.cau_hoi || [
                                  { id: `${dauTriActiveIndex + 1}_1`, noi_dung: '', dap_an_dung: '', chu_thich: '' },
                                  { id: `${dauTriActiveIndex + 1}_2`, noi_dung: '', dap_an_dung: '', chu_thich: '' },
                                  { id: `${dauTriActiveIndex + 1}_3`, noi_dung: '', dap_an_dung: '', chu_thich: '' }
                                ]
                              }
                            }))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-indigo-300 font-bold"
                          />
                        </div>

                        {/* 3 Bonus Questions */}
                        <div className="space-y-3">
                          {[0, 1, 2].map((bIdx) => {
                            const bonusQ = currentQ.goi_thuong?.cau_hoi?.[bIdx] || {
                              id: `${dauTriActiveIndex + 1}_${bIdx + 1}`,
                              noi_dung: '',
                              dap_an_dung: '',
                              chu_thich: ''
                            };

                            const updateBonusQ = (updater: (prev: DauTriBonusQuestion) => DauTriBonusQuestion) => {
                              updateCurrentQ(q => {
                                const currentBonusList = [...(q.goi_thuong?.cau_hoi || [
                                  { id: `${dauTriActiveIndex + 1}_1`, noi_dung: '', dap_an_dung: '', chu_thich: '' },
                                  { id: `${dauTriActiveIndex + 1}_2`, noi_dung: '', dap_an_dung: '', chu_thich: '' },
                                  { id: `${dauTriActiveIndex + 1}_3`, noi_dung: '', dap_an_dung: '', chu_thich: '' }
                                ])];
                                currentBonusList[bIdx] = updater(currentBonusList[bIdx] || bonusQ);
                                return {
                                  ...q,
                                  goi_thuong: {
                                    chu_de: q.goi_thuong?.chu_de || `Chủ đề thưởng ${dauTriActiveIndex + 1}`,
                                    cau_hoi: currentBonusList
                                  }
                                };
                              });
                            };

                            return (
                              <div key={bIdx} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono text-[10px] font-bold flex items-center justify-center">
                                      {bIdx + 1}
                                    </span>
                                    Câu Hỏi Thưởng #{bIdx + 1} (10 Điểm)
                                  </span>
                                </div>

                                <div>
                                  <label className="text-[9px] font-bold text-slate-500 block mb-1 uppercase">Nội Dung Câu Thưởng {bIdx + 1}</label>
                                  <textarea
                                    rows={2}
                                    placeholder={`Nhập câu hỏi thưởng số ${bIdx + 1}...`}
                                    value={bonusQ.noi_dung}
                                    onChange={(e) => updateBonusQ(b => ({ ...b, noi_dung: e.target.value }))}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-white resize-none"
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[9px] font-bold text-slate-500 block mb-1 uppercase">Đáp Án Thưởng {bIdx + 1}</label>
                                    <input
                                      type="text"
                                      placeholder="Đáp án đúng..."
                                      value={bonusQ.dap_an_dung}
                                      onChange={(e) => updateBonusQ(b => ({ ...b, dap_an_dung: e.target.value.toUpperCase() }))}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-emerald-400 font-bold uppercase"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[9px] font-bold text-slate-500 block mb-1 uppercase">Giải Thích / Chú Thích</label>
                                    <input
                                      type="text"
                                      placeholder="Giải thích thêm..."
                                      value={bonusQ.chu_thich || ''}
                                      onChange={(e) => updateBonusQ(b => ({ ...b, chu_thich: e.target.value }))}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-300"
                                    />
                                  </div>
                                </div>

                                {/* Media for Bonus Question */}
                                <div className="pt-2 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                                  <div className="sm:col-span-8">
                                    <label className="text-[9px] font-bold text-slate-500 block mb-1 uppercase">Media Câu Thưởng (URL)</label>
                                    <input
                                      type="text"
                                      placeholder="URL ảnh, video, âm thanh..."
                                      value={bonusQ.media?.url || ''}
                                      onChange={(e) => {
                                        const url = e.target.value.trim();
                                        let type = bonusQ.media?.type || 'image';
                                        if (url.match(/\.(mp3|wav|ogg|m4a)($|\?)/i)) type = 'audio';
                                        else if (url.match(/\.(mp4|webm|mov)($|\?)/i) || url.includes('youtube.com') || url.includes('youtu.be')) type = 'video';
                                        updateBonusQ(b => ({
                                          ...b,
                                          media: url ? { url, type } : undefined
                                        }));
                                      }}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
                                    />
                                  </div>
                                  <div className="sm:col-span-4">
                                    <label className="text-[9px] font-bold text-slate-500 block mb-1 uppercase">Loại Media</label>
                                    <select
                                      value={bonusQ.media?.type || 'image'}
                                      onChange={(e) => {
                                        const type = e.target.value as 'image' | 'video' | 'audio';
                                        if (bonusQ.media?.url) {
                                          updateBonusQ(b => ({
                                            ...b,
                                            media: { url: b.media!.url, type }
                                          }));
                                        }
                                      }}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-white font-bold"
                                    >
                                      <option value="image">🖼️ Ảnh</option>
                                      <option value="video">🎥 Video</option>
                                      <option value="audio">🔊 Âm thanh</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === 'MEDIA' && (
              <div className="space-y-4">
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wide">
                      <Film className="w-4 h-4 text-indigo-400" />
                      Danh Sách Media Ngoài (Intro, Văn Nghệ, Nhạc Nền...)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Media ngoài dùng để phát độc lập trong trận đấu (video Intro, nhạc văn nghệ, poster...). Kích hoạt hiển thị trực tiếp bằng nút "Hiển thị" hoặc thông qua Web Đạo Diễn.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setDraftMediaName('');
                      setDraftMediaUrlItem('');
                      setDraftMediaTypeItem('video');
                      setEditMediaModal({ isOpen: true, item: null });
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm Media Mới
                  </button>
                </div>

                {mediaNgoai.length === 0 ? (
                  <div className="text-center py-12 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl space-y-2">
                    <Film className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400 font-bold">Chưa có media ngoài nào được thêm.</p>
                    <p className="text-[10px] text-slate-500">Bạn có thể tự thêm media trực tiếp hoặc nạp từ tab "Media" trong file Excel.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mediaNgoai.map((item, idx) => (
                      <div key={item.id || idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                              {item.type === 'audio' && <Music className="w-4 h-4 text-emerald-400" />}
                              {item.type === 'video' && <Video className="w-4 h-4 text-indigo-400" />}
                              {item.type === 'image' && <Image className="w-4 h-4 text-amber-400" />}
                              {item.name || `Media ${idx + 1}`}
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                              item.type === 'audio' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              item.type === 'video' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {item.type}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-slate-500 font-mono truncate">{item.url}</p>

                          <div className="max-h-32 overflow-hidden bg-slate-900 border border-slate-800/80 rounded-lg p-1 flex items-center justify-center">
                            <UniversalMediaPlayer
                              media={{ url: item.url, type: item.type }}
                              className="max-h-28 w-auto"
                              hideControls={false}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
                          {adminCommand && (
                            <button
                              onClick={() => {
                                adminCommand(SocketEvent.ADMIN_SET_EXTERNAL_MEDIA, {
                                  id: item.id,
                                  name: item.name,
                                  url: item.url,
                                  type: item.type,
                                  isPlaying: true
                                });
                                setStatus({ type: 'success', message: `Đã phát media "${item.name}" trên toàn bộ hệ thống!` });
                              }}
                              className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              Phát Trên Trận Đấu
                            </button>
                          )}

                          <div className="flex items-center gap-1.5 ml-auto">
                            <button
                              onClick={() => {
                                setDraftMediaName(item.name);
                                setDraftMediaUrlItem(item.url);
                                setDraftMediaTypeItem(item.type);
                                setEditMediaModal({ isOpen: true, item });
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all cursor-pointer"
                              title="Sửa media"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setMediaNgoai(prev => prev.filter(m => m.id !== item.id));
                              }}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all cursor-pointer"
                              title="Xóa media"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Row Bottom - Single Unified Auto-Save Status */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-800/60 text-xs text-slate-400">
            <span className="text-[11px] text-slate-500 italic">
              Dữ liệu được tự động lưu lên máy chủ và cập nhật trực tiếp vào trận đấu đang chạy.
            </span>
            {lastAutoSaveTime && (
              <span className="text-[11px] font-mono font-bold text-emerald-400">
                Lần lưu gần nhất: {lastAutoSaveTime}
              </span>
            )}
          </div>

        </div>

      </div>

      {/* 1. CREATE MATCH MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider text-indigo-400">Tạo bộ đề thi mới</h3>
              <p className="text-xs text-slate-400 mt-1">Cấu hình tên/mã đề và mật khẩu để bắt đầu thiết lập câu hỏi.</p>
            </div>

            {newMatchError && (
              <div className="p-3 bg-red-500/15 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
                {newMatchError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-indigo-400 block mb-1 uppercase tracking-wide">
                  Mã ID Bộ Đề (Tạo Tự Động Ngẫu Nhiên)
                </label>
                <div className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl px-3 py-2.5 text-center font-mono font-black text-lg text-indigo-300 tracking-widest select-all">
                  {newMatchCode}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  🔒 Mã đề gồm 6 chữ số được hệ thống tự động sinh ngẫu nhiên và bảo mật cho tài khoản của bạn.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                  Tên Bộ Đề Thi (Tùy Chọn)
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên gọi bộ đề (VD: Đề Tuần 1 Tháng 2)..."
                  value={newMatchName}
                  onChange={(e) => setNewMatchName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                  Mật Khẩu Bộ Đề (Cho thí sinh & MC đăng nhập)
                </label>
                <input
                  type="text"
                  placeholder="Mặc định: 123"
                  value={newMatchPassword}
                  onChange={(e) => setNewMatchPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmCreateNewMatch}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer"
              >
                {loading ? 'Đang tạo...' : 'Xác nhận tạo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MEDIA ATTACHMENT MODAL */}
      {mediaModalState?.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider text-indigo-400">Đính Kèm Media Câu Hỏi</h3>
              <p className="text-xs text-slate-400 mt-1">
                Gắn liên kết hình ảnh, âm thanh hoặc video cho câu hỏi của vòng thi.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Đường dẫn liên kết (URL)</label>
                <input
                  type="text"
                  placeholder="Nhập link HTTPS (VD: Google Drive, YouTube, MP3 trực tiếp)"
                  value={mediaModalState.url}
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    let detectedType = mediaModalState.type;
                    if (newUrl) {
                      const lower = newUrl.toLowerCase();
                      if (lower.match(/\.(mp3|wav|ogg|m4a|aac|flac)($|\?)/)) {
                        detectedType = 'audio';
                      } else if ((lower.match(/\.(mp4|webm|mov)($|\?)/) || lower.includes('youtube.com') || lower.includes('youtu.be')) && detectedType !== 'audio') {
                        detectedType = 'video';
                      }
                    }
                    setMediaModalState({ ...mediaModalState, url: newUrl, type: detectedType });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  💡 <b>Mẹo Google Drive:</b> Cần chuyển quyền tệp trên Drive thành <i>"Người có liên kết có thể xem"</i> (Anyone with link).
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Loại Media</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['image', 'audio', 'video'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMediaModalState({ ...mediaModalState, type })}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        mediaModalState.type === type
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      {type === 'image' && '🖼️ Hình Ảnh'}
                      {type === 'audio' && '🔊 Âm Thanh'}
                      {type === 'video' && '🎥 Video Clip'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              {mediaModalState.url && (
                <div className="pt-2 space-y-1">
                  <label className="text-[10px] font-bold text-teal-400 block uppercase">Xem Trước Media Đính Kèm</label>
                  <UniversalMediaPlayer
                    media={{ url: mediaModalState.url, type: mediaModalState.type }}
                    mediaControl={{ isPlaying: true, key: Date.now() }}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleSaveMedia('', 'image')}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Gỡ bỏ Media
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setMediaModalState(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleSaveMedia(mediaModalState.url, mediaModalState.type)}
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer"
                >
                  Lưu đính kèm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. EDIT / ADD QUESTION MODAL */}
      {editQuestionModal?.isOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider text-indigo-400">
                  {editQuestionModal.questionId ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Vòng {editQuestionModal.round === 'KHOI_DONG' ? 'Khởi Động' : 'Về Đích'}
                </p>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {editQuestionModal.questionId ? `ID: ${editQuestionModal.questionId}` : 'CÂU HỎI MỚI'}
              </span>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {/* Lĩnh Vực & Điểm (Nếu Về Đích) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Lĩnh Vực</label>
                  <select
                    value={draftLinhVuc}
                    onChange={(e) => setDraftLinhVuc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white font-bold"
                  >
                    {LING_VUC_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {editQuestionModal.round === 'VE_DICH' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Mức Điểm</label>
                    <select
                      value={draftMucDiem}
                      onChange={(e) => setDraftMucDiem(parseInt(e.target.value) as 10 | 20 | 30 | 40)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-teal-400 font-bold"
                    >
                      <option value={10}>10 Điểm (10s)</option>
                      <option value={20}>20 Điểm (15s)</option>
                      <option value={30}>30 Điểm (20s)</option>
                      <option value={40}>40 Điểm (30s)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Nội dung Câu Hỏi */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Nội Dung Câu Hỏi</label>
                <textarea
                  rows={3}
                  placeholder="Nhập nội dung câu hỏi chi tiết..."
                  value={draftNoiDung}
                  onChange={(e) => setDraftNoiDung(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white resize-none"
                />
              </div>

              {/* Đáp Án Đúng */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Đáp Án Đúng</label>
                <input
                  type="text"
                  placeholder="Nhập đáp án đúng..."
                  value={draftDapAnDung}
                  onChange={(e) => setDraftDapAnDung(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-teal-400 font-bold uppercase"
                />
              </div>

              {/* Chú Thích / Giải Thích */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Giải Thích / Chú Thích</label>
                <input
                  type="text"
                  placeholder="Giải thích thêm cho câu hỏi hoặc đáp án..."
                  value={draftChuThich}
                  onChange={(e) => setDraftChuThich(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-300"
                />
              </div>

              {/* Đính kèm Media */}
              <div className="border-t border-slate-800/80 pt-3 mt-2">
                <label className="text-[10px] font-black text-indigo-400 block mb-2 uppercase tracking-wide">
                  Đính Kèm Media Câu Hỏi (Tùy Chọn)
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-8">
                    <label className="text-[9px] font-bold text-slate-500 block mb-1 uppercase">Đường dẫn liên kết (URL)</label>
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg hoặc video..."
                      value={draftMediaUrl}
                      onChange={(e) => setDraftMediaUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white font-mono"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="text-[9px] font-bold text-slate-500 block mb-1 uppercase">Loại Media</label>
                    <select
                      value={draftMediaType}
                      onChange={(e) => setDraftMediaType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white font-bold"
                    >
                      <option value="image">🖼️ Hình Ảnh</option>
                      <option value="audio">🔊 Âm Thanh</option>
                      <option value="video">🎥 Video Clip</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800/80">
              {editQuestionModal.questionId ? (
                <button
                  onClick={handleDeleteQuestionFromModal}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa câu hỏi
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setEditQuestionModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSaveQuestionFromModal}
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. EDIT / ADD EXTERNAL MEDIA ITEM MODAL */}
      {editMediaModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Film className="w-4 h-4" />
                {editMediaModal.item ? 'Chỉnh Sửa Media Ngoài' : 'Thêm Media Ngoài Mới'}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Tên Media (Ví dụ: Video Intro, Nhạc Văn Nghệ...)</label>
                <input
                  type="text"
                  value={draftMediaName}
                  onChange={(e) => setDraftMediaName(e.target.value)}
                  placeholder="Nhập tên mô tả media..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Đường dẫn URL Media</label>
                <input
                  type="text"
                  value={draftMediaUrlItem}
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    let detectedType = draftMediaTypeItem;
                    if (newUrl) {
                      const lower = newUrl.toLowerCase();
                      if (lower.match(/\.(mp3|wav|ogg|m4a|aac|flac)($|\?)/)) {
                        detectedType = 'audio';
                      } else if ((lower.match(/\.(mp4|webm|mov)($|\?)/) || lower.includes('youtube.com') || lower.includes('youtu.be')) && detectedType !== 'audio') {
                        detectedType = 'video';
                      }
                    }
                    setDraftMediaUrlItem(newUrl);
                    setDraftMediaTypeItem(detectedType);
                  }}
                  placeholder="https://example.com/media.mp4..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Định dạng Media</label>
                <select
                  value={draftMediaTypeItem}
                  onChange={(e) => setDraftMediaTypeItem(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                >
                  <option value="audio">🔊 AUDIO (Nhạc hiệu / Âm thanh MP3)</option>
                  <option value="video">🎥 VIDEO (Clip mp4 / YouTube / Drive)</option>
                  <option value="image">🖼️ IMAGE (Hình ảnh PNG / JPG)</option>
                </select>
              </div>

              {draftMediaUrlItem.trim() && (
                <div className="mt-2 p-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center max-h-40 overflow-hidden">
                  <UniversalMediaPlayer
                    media={{ url: draftMediaUrlItem.trim(), type: draftMediaTypeItem }}
                    className="max-h-36 w-auto"
                    hideControls={false}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditMediaModal({ isOpen: false, item: null })}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  if (!draftMediaName.trim() || !draftMediaUrlItem.trim()) {
                    alert('Vui lòng điền đầy đủ Tên Media và Đường dẫn URL!');
                    return;
                  }
                  const newItem: ExternalMediaItem = {
                    id: editMediaModal.item?.id || `MEDIA_${Date.now()}`,
                    name: draftMediaName.trim(),
                    url: draftMediaUrlItem.trim(),
                    type: draftMediaTypeItem
                  };

                  if (editMediaModal.item) {
                    setMediaNgoai(prev => prev.map(m => m.id === editMediaModal.item?.id ? newItem : m));
                  } else {
                    setMediaNgoai(prev => [...prev, newItem]);
                  }

                  setEditMediaModal({ isOpen: false, item: null });
                }}
                className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                Lưu Media
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SAVE EXCEL MATCH MODAL (When importing Excel without an active match) */}
      {showExcelSaveModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Lưu Đề Thi Mới Từ Excel
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowExcelSaveModal(false);
                  setExcelPendingWb(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Tập tin tải lên:</span>
                <span className="text-emerald-400 font-mono font-bold truncate max-w-[200px]">{excelPendingFileName}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Bạn chưa chọn hoặc tạo đề thi. Vui lòng đặt tên và mật khẩu để hệ thống tự động tạo mã ID 6 số và lưu đề thi này vào tài khoản của bạn.
              </p>
            </div>

            {excelModalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{excelModalError}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* ID Đề Thi (6 số ngẫu nhiên) */}
              <div>
                <label className="text-[10px] font-black text-emerald-400 block mb-1 uppercase tracking-wide">
                  Mã ID Đề Thi (Tạo Tự Động Ngẫu Nhiên)
                </label>
                <div className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2.5 text-center font-mono font-black text-lg text-emerald-300 tracking-widest select-all">
                  {excelModalCode}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  🔒 Mã đề gồm 6 chữ số được hệ thống tự động sinh ngẫu nhiên cho tệp đề thi này.
                </p>
              </div>

              {/* Tên Bộ Đề Thi */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                  Tên Bộ Đề Thi
                </label>
                <input
                  type="text"
                  value={excelModalName}
                  onChange={(e) => setExcelModalName(e.target.value)}
                  placeholder="Nhập tên gọi bộ đề (VD: Đề Tuần 1 Tháng 2)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              {/* Mật Khẩu Đề */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                  Mật Khẩu Đề Thi
                </label>
                <input
                  type="text"
                  value={excelModalPassword}
                  onChange={(e) => setExcelModalPassword(e.target.value)}
                  placeholder="Mặc định: 123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowExcelSaveModal(false);
                  setExcelPendingWb(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmExcelSave}
                disabled={loading || !excelModalCode.trim()}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {loading ? 'Đang lưu...' : 'LƯU & NẠP ĐỀ THI'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. DELETE MATCH CONFIRMATION MODAL */}
      {matchToDelete && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-red-400">
                <Trash2 className="w-5 h-5" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Xác Nhận Xóa Bộ Đề
                </h3>
              </div>
              <button
                onClick={() => setMatchToDelete(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-2">
              <p className="text-xs text-red-200">
                Bạn có chắc chắn muốn xóa vĩnh viễn bộ đề thi:
              </p>
              <div className="bg-slate-950 border border-red-500/30 rounded-lg px-3 py-2 text-center">
                <span className="font-mono font-black text-base text-red-400 tracking-wider">
                  [{matchToDelete}]
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ⚠️ Dữ liệu bộ đề này sẽ bị xóa hoàn toàn khỏi tài khoản và máy chủ. Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setMatchToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={confirmDeleteMatch}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl cursor-pointer shadow-lg shadow-red-600/20 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Đang xóa...' : 'XÁC NHẬN XÓA VĨNH VIỄN'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
