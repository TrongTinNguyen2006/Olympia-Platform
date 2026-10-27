import React from 'react';

export interface PresetRoundLogo {
  id: string;
  name: string;
  category: 'Vòng thi' | 'Biểu trưng' | 'Danh hiệu';
  description: string;
  recommendedFor?: string[];
  svg: (props: { className?: string }) => React.ReactElement;
}

export const PRESET_ROUND_LOGOS: PresetRoundLogo[] = [
  {
    id: 'olympia_laurel',
    name: 'Vòng Nguyệt Quế Hoàng Kim',
    category: 'Biểu trưng',
    description: 'Vòng nguyệt quế đôi uốn lượn với ngôi sao vàng vinh quang ở giữa',
    recommendedFor: ['SUMMARY', 'WAITING'],
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="goldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#A16207" />
          </linearGradient>
          <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Laurel Wreath Left */}
        <path
          d="M32 76C24 64 22 46 28 32C29 30 31 34 32 36C30 46 32 60 38 70C39 72 35 75 32 76Z"
          fill="url(#goldGrad1)"
        />
        <path d="M22 42C16 36 18 28 22 24C24 28 24 34 26 38L22 42Z" fill="#FACC15" />
        <path d="M18 54C12 50 12 42 16 38C19 42 20 48 22 52L18 54Z" fill="#EAB308" />
        <path d="M22 66C16 64 16 56 20 52C23 56 25 61 26 64L22 66Z" fill="#CA8A04" />
        <path d="M28 76C24 76 22 70 26 66C29 69 31 73 32 75L28 76Z" fill="#A16207" />

        {/* Laurel Wreath Right */}
        <path
          d="M68 76C76 64 78 46 72 32C71 30 69 34 68 36C70 46 68 60 62 70C61 72 65 75 68 76Z"
          fill="url(#goldGrad1)"
        />
        <path d="M78 42C84 36 82 28 78 24C76 28 76 34 74 38L78 42Z" fill="#FACC15" />
        <path d="M82 54C88 50 88 42 84 38C81 42 80 48 78 52L82 54Z" fill="#EAB308" />
        <path d="M78 66C84 64 84 56 80 52C77 56 75 61 74 64L78 66Z" fill="#CA8A04" />
        <path d="M72 76C76 76 78 70 74 66C71 69 69 73 68 75L72 76Z" fill="#A16207" />

        {/* Bottom Ribbon */}
        <path
          d="M40 82C46 80 54 80 60 82C62 84 58 87 50 86C42 87 38 84 40 82Z"
          fill="url(#goldGrad1)"
        />

        {/* Center Star */}
        <polygon
          points="50,22 53,32 63,32 55,38 58,48 50,42 42,48 45,38 37,32 47,32"
          fill="#FEF08A"
          stroke="#CA8A04"
          strokeWidth="1.5"
          filter="url(#glowGold)"
        />
        <circle cx="50" cy="56" r="8" fill="url(#goldGrad1)" stroke="#FEF08A" strokeWidth="1" />
        <polygon points="50,51 52,55 56,55 53,58 54,62 50,59 46,62 47,58 44,55 48,55" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: 'kd_rocket',
    name: 'Tên Lửa Khởi Động',
    category: 'Vòng thi',
    description: 'Tên lửa vút bay bứt phá với ngọn lửa xanh ngọc lục bảo',
    recommendedFor: ['KHOI_DONG'],
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="rocketBody" x1="20%" y1="20%" x2="80%" y2="80%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>
          <linearGradient id="rocketFlame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        {/* Speed Trails */}
        <path d="M15 85L32 68" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
        <path d="M25 90L40 75" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M10 75L22 63" stroke="#6EE7B7" strokeWidth="2" strokeLinecap="round" />

        {/* Thruster Flame */}
        <path
          d="M34 66C31 72 26 82 22 84C24 78 30 71 36 64L34 66Z"
          fill="url(#rocketFlame)"
        />
        <path
          d="M37 63C33 71 27 79 24 81C28 75 33 68 38 61L37 63Z"
          fill="#FEF08A"
        />

        {/* Wings */}
        <path d="M38 52L24 62L36 68L44 60L38 52Z" fill="#047857" stroke="#A7F3D0" strokeWidth="1" />
        <path d="M48 42L58 28L64 36L56 48L48 42Z" fill="#047857" stroke="#A7F3D0" strokeWidth="1" />

        {/* Rocket Body */}
        <path
          d="M78 22C74 26 56 34 44 48C38 55 35 63 36 67L39 68C43 69 51 66 58 60C72 48 80 30 84 26C84 25 83 23 81 22L78 22Z"
          fill="url(#rocketBody)"
          stroke="#A7F3D0"
          strokeWidth="1.5"
        />
        {/* Cockpit Window */}
        <circle cx="62" cy="42" r="5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
        <circle cx="63" cy="41" r="1.5" fill="#FFFFFF" />

        {/* Stars */}
        <polygon points="76,14 78,18 82,18 79,21 80,25 76,23 72,25 73,21 70,18 74,18" fill="#FDE047" />
        <polygon points="20,24 21,26 23,26 21,28 22,30 20,29 18,30 19,28 17,26 19,26" fill="#6EE7B7" />
      </svg>
    ),
  },
  {
    id: 'vcnv_puzzle',
    name: 'Mảnh Ghép Chướng Ngại Vật',
    category: 'Vòng thi',
    description: 'Bộ 4 mảnh ghép liên kết vững chắc xoay quanh dấu hỏi vàng cam',
    recommendedFor: ['VCNV'],
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="puzzleAmber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        {/* Background shield ring */}
        <circle cx="50" cy="50" r="42" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />

        {/* 4 Puzzle Quadrants */}
        {/* Top-Left */}
        <path
          d="M26 26H46C49 26 49 32 46 34C43 36 43 42 46 44V46H26V26Z"
          fill="url(#puzzleAmber)"
          stroke="#FEF3C7"
          strokeWidth="1.5"
        />
        {/* Top-Right */}
        <path
          d="M54 26H74V46H54V44C57 42 57 36 54 34C51 32 51 26 54 26Z"
          fill="#D97706"
          stroke="#FEF3C7"
          strokeWidth="1.5"
        />
        {/* Bottom-Left */}
        <path
          d="M26 54H46V56C43 58 43 64 46 66C49 68 49 74 46 74H26V54Z"
          fill="#B45309"
          stroke="#FEF3C7"
          strokeWidth="1.5"
        />
        {/* Bottom-Right */}
        <path
          d="M54 54H74V74H54C51 74 51 68 54 66C57 64 57 58 54 56V54Z"
          fill="url(#puzzleAmber)"
          stroke="#FEF3C7"
          strokeWidth="1.5"
        />

        {/* Center Glowing Lock / Question Badge */}
        <circle cx="50" cy="50" r="14" fill="#1E1B4B" stroke="#FDE047" strokeWidth="2.5" />
        <text
          x="50"
          y="56"
          textAnchor="middle"
          fontSize="18"
          fontWeight="900"
          fill="#FDE047"
          fontFamily="system-ui, sans-serif"
        >
          ?
        </text>
      </svg>
    ),
  },
  {
    id: 'tang_toc_lightning',
    name: 'Tia Chớp Tăng Tốc',
    category: 'Vòng thi',
    description: 'Tia chớp năng lượng tím lồng trong đồng hồ đo tốc độ 30 giây',
    recommendedFor: ['TANG_TOC'],
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="speedViolet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#6B21A8" />
          </linearGradient>
          <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        {/* Tachometer Outer Ring */}
        <path
          d="M20 72A38 38 0 1 1 80 72"
          stroke="url(#speedViolet)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Speed Ticks */}
        <circle cx="28" cy="35" r="2" fill="#E9D5FF" />
        <circle cx="50" cy="24" r="2.5" fill="#FDE047" />
        <circle cx="72" cy="35" r="2" fill="#F43F5E" />

        {/* Dual Lightning Bolt */}
        <polygon
          points="54,16 34,48 48,48 40,84 68,44 52,44"
          fill="url(#boltGrad)"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Core highlight */}
        <polygon
          points="53,24 39,46 48,46 43,72 61,46 51,46"
          fill="#FFFFFF"
          opacity="0.6"
        />
      </svg>
    ),
  },
  {
    id: 've_dich_trophy',
    name: 'Cúp Vàng Về Đích',
    category: 'Vòng thi',
    description: 'Cúp vô địch hoàng kim với lá cờ ca-rô đích chiến thắng',
    recommendedFor: ['VE_DICH', 'SUMMARY'],
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="goldCup" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="40%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#854D0E" />
          </linearGradient>
        </defs>
        {/* Checkered Flag Background Left */}
        <path d="M22 22L34 26L32 38L20 34Z" fill="#FFFFFF" />
        <path d="M26 23L34 26L33 32L25 29Z" fill="#EF4444" />
        <path d="M20 28L28 30L27 36L19 33Z" fill="#EF4444" />
        <line x1="18" y1="20" x2="24" y2="54" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

        {/* Trophy Cup Body */}
        <path
          d="M34 28H66C66 44 58 54 50 56C42 54 34 44 34 28Z"
          fill="url(#goldCup)"
          stroke="#FDE047"
          strokeWidth="2"
        />
        {/* Trophy Handles */}
        <path
          d="M34 32C24 32 24 44 36 46"
          stroke="url(#goldCup)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M66 32C76 32 76 44 64 46"
          stroke="url(#goldCup)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Stem and Base */}
        <path d="M47 56H53V68H47V56Z" fill="#CA8A04" stroke="#FDE047" strokeWidth="1.5" />
        <path d="M36 68H64L66 78H34L36 68Z" fill="url(#goldCup)" stroke="#FDE047" strokeWidth="1.5" />
        <rect x="30" y="78" width="40" height="6" rx="2" fill="#78350F" stroke="#EAB308" strokeWidth="1" />

        {/* Star in Center of Cup */}
        <polygon
          points="50,34 52,39 57,39 53,42 55,47 50,44 45,47 47,42 43,39 48,39"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
  {
    id: 'ch_phu_star',
    name: 'Ngôi Sao Quyết Định',
    category: 'Vòng thi',
    description: 'Ngôi sao 5 cánh xanh cyan 3D lấp lánh cho vòng Câu hỏi phụ',
    recommendedFor: ['CH_PHU'],
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="cyanStar1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="100%" stopColor="#0891B2" />
          </linearGradient>
          <linearGradient id="cyanStar2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A5F3FC" />
            <stop offset="100%" stopColor="#0E7490" />
          </linearGradient>
        </defs>
        {/* Target Ring */}
        <circle cx="50" cy="50" r="38" stroke="#06B6D4" strokeWidth="2" strokeDasharray="8 6" opacity="0.5" />
        <circle cx="50" cy="50" r="28" stroke="#22D3EE" strokeWidth="1.5" opacity="0.3" />

        {/* Crosshair Lines */}
        <line x1="50" y1="8" x2="50" y2="18" stroke="#67E8F9" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="82" x2="50" y2="92" stroke="#67E8F9" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="50" x2="18" y2="50" stroke="#67E8F9" strokeWidth="2" strokeLinecap="round" />
        <line x1="82" y1="50" x2="92" y2="50" stroke="#67E8F9" strokeWidth="2" strokeLinecap="round" />

        {/* 3D Faceted Star */}
        {/* Top Spike */}
        <polygon points="50,18 50,50 40,43" fill="url(#cyanStar1)" />
        <polygon points="50,18 60,43 50,50" fill="url(#cyanStar2)" />
        {/* Right Spike */}
        <polygon points="84,40 50,50 60,43" fill="url(#cyanStar1)" />
        <polygon points="84,40 66,58 50,50" fill="url(#cyanStar2)" />
        {/* Bottom Right Spike */}
        <polygon points="71,78 50,50 66,58" fill="url(#cyanStar1)" />
        <polygon points="71,78 50,62 50,50" fill="url(#cyanStar2)" />
        {/* Bottom Left Spike */}
        <polygon points="29,78 50,50 50,62" fill="url(#cyanStar1)" />
        <polygon points="29,78 34,58 50,50" fill="url(#cyanStar2)" />
        {/* Left Spike */}
        <polygon points="16,40 50,50 34,58" fill="url(#cyanStar1)" />
        <polygon points="16,40 40,43 50,50" fill="url(#cyanStar2)" />

        {/* Center Sparkle */}
        <circle cx="50" cy="50" r="3" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: 'jeopardy_grid',
    name: 'Bảng Vàng Điểm Số Jeopardy',
    category: 'Vòng thi',
    description: 'Bảng điểm 9 ô hoàng kim sang trọng với biểu tượng điểm số đô la $',
    recommendedFor: ['JEOPARDY'],
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="goldBoard" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>
        {/* Board Background */}
        <rect x="18" y="18" width="64" height="64" rx="8" fill="#1E1B4B" stroke="url(#goldBoard)" strokeWidth="3" />

        {/* 3x3 Grid Lines */}
        <line x1="39" y1="20" x2="39" y2="80" stroke="#FBBF24" strokeWidth="1.5" opacity="0.4" />
        <line x1="61" y1="20" x2="61" y2="80" stroke="#FBBF24" strokeWidth="1.5" opacity="0.4" />
        <line x1="20" y1="39" x2="80" y2="39" stroke="#FBBF24" strokeWidth="1.5" opacity="0.4" />
        <line x1="20" y1="61" x2="80" y2="61" stroke="#FBBF24" strokeWidth="1.5" opacity="0.4" />

        {/* Gold Dollar Center Coin */}
        <circle cx="50" cy="50" r="16" fill="url(#goldBoard)" stroke="#FEF08A" strokeWidth="2" />
        <text
          x="50"
          y="57"
          textAnchor="middle"
          fontSize="22"
          fontWeight="900"
          fill="#451A03"
          fontFamily="system-ui, sans-serif"
        >
          $
        </text>

        {/* Corner Accents */}
        <circle cx="28" cy="28" r="2" fill="#FDE047" />
        <circle cx="72" cy="28" r="2" fill="#FDE047" />
        <circle cx="28" cy="72" r="2" fill="#FDE047" />
        <circle cx="72" cy="72" r="2" fill="#FDE047" />
      </svg>
    ),
  },
  {
    id: 'mtk_matrix',
    name: 'Ma Trận Số Cyber',
    category: 'Vòng thi',
    description: 'Lưới ô ma trận công nghệ số phát sáng neon sắc xanh chàm',
    recommendedFor: ['MA_TRAN_KEP'],
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="matrixGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#3730A3" />
          </linearGradient>
        </defs>
        {/* Outer Isometric Hexagon / Diamond */}
        <polygon
          points="50,14 84,32 84,68 50,86 16,68 16,32"
          fill="#0F172A"
          stroke="url(#matrixGrad)"
          strokeWidth="2.5"
        />

        {/* Matrix Grid Internal Tiles */}
        <polygon points="50,22 76,36 50,50 24,36" fill="#1E1B4B" stroke="#818CF8" strokeWidth="1.5" />
        <polygon points="24,42 50,56 50,78 24,64" fill="#312E81" stroke="#818CF8" strokeWidth="1.5" />
        <polygon points="50,56 76,42 76,64 50,78" fill="#1E293B" stroke="#818CF8" strokeWidth="1.5" />

        {/* Matrix Glowing Nodes */}
        <circle cx="50" cy="36" r="3" fill="#22D3EE" />
        <circle cx="37" cy="56" r="3" fill="#A5B4FC" />
        <circle cx="63" cy="56" r="3" fill="#F472B6" />
        <circle cx="50" cy="50" r="4.5" fill="#FFFFFF" stroke="#6366F1" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'cp_mountain',
    name: 'Đỉnh Núi Chinh Phục',
    category: 'Vòng thi',
    description: 'Đỉnh núi Olympia tuyết phủ với lá cờ chiến thắng bay phấp phới',
    recommendedFor: ['CHINH_PHUC'],
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="mountainSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="mountainRock" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#0F766E" />
          </linearGradient>
        </defs>
        {/* Background Circle */}
        <circle cx="50" cy="50" r="40" fill="url(#mountainSky)" stroke="#2DD4BF" strokeWidth="2.5" />

        {/* Sun in background */}
        <circle cx="50" cy="38" r="14" fill="#FDE047" opacity="0.85" />

        {/* Back Mountain */}
        <polygon points="68,44 86,76 50,76" fill="#0D9488" opacity="0.7" />
        {/* Front Majestic Mountain */}
        <polygon points="46,26 18,80 74,80" fill="url(#mountainRock)" />
        {/* Snow Peak Cap */}
        <polygon points="46,26 36,46 44,42 48,48 56,40" fill="#F0FDFA" />

        {/* Flag on Peak */}
        <line x1="46" y1="16" x2="46" y2="30" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <polygon points="46,16 62,21 46,26" fill="#EF4444" />
        <polygon points="50,19 52,21 54,20 52,22 53,24 50,22 48,24 49,22 47,21 49,20" fill="#FDE047" />
      </svg>
    ),
  },
  {
    id: 'dt_intellect',
    name: 'Đấu Trí - Song Kiếm Trí Tuệ',
    category: 'Vòng thi',
    description: 'Bộ não trí tuệ phát sáng cùng hai thanh gươm đan chéo kiêu hãnh',
    recommendedFor: ['DAU_TRI'],
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="swordGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#BE123C" />
          </linearGradient>
        </defs>
        {/* Crossed Swords in background */}
        {/* Sword 1 */}
        <line x1="22" y1="22" x2="78" y2="78" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
        <line x1="72" y1="68" x2="82" y2="78" stroke="#CBD5E1" strokeWidth="7" strokeLinecap="round" />
        <circle cx="82" cy="82" r="4" fill="#F59E0B" />

        {/* Sword 2 */}
        <line x1="78" y1="22" x2="22" y2="78" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
        <line x1="28" y1="68" x2="18" y2="78" stroke="#CBD5E1" strokeWidth="7" strokeLinecap="round" />
        <circle cx="18" cy="82" r="4" fill="#F59E0B" />

        {/* Brain Intellect Crest */}
        {/* Left Hemisphere */}
        <path
          d="M50 32C42 32 34 38 34 46C34 50 36 54 38 56C36 60 38 66 44 68C47 69 49 67 50 66"
          fill="url(#swordGrad)"
          stroke="#FDA4AF"
          strokeWidth="2"
        />
        {/* Right Hemisphere */}
        <path
          d="M50 32C58 32 66 38 66 46C66 50 64 54 62 56C64 60 62 66 56 68C53 69 51 67 50 66"
          fill="url(#swordGrad)"
          stroke="#FDA4AF"
          strokeWidth="2"
        />
        {/* Neural lines inside brain */}
        <path d="M42 44C46 44 48 48 44 52" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M58 44C54 44 52 48 56 52" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="50" cy="48" r="4" fill="#FEF08A" />
      </svg>
    ),
  },
  {
    id: 'torch_flame',
    name: 'Đuốc Sáng Tri Thức',
    category: 'Biểu trưng',
    description: 'Ngọn đuốc Olympic rực sáng ngọn lửa nhiệt huyết tri thức',
    recommendedFor: ['KHOI_DONG', 'WAITING'],
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="torchFire" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="40%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
        </defs>
        {/* Fire Sparks */}
        <circle cx="38" cy="20" r="2.5" fill="#FDE047" />
        <circle cx="62" cy="18" r="2" fill="#F97316" />

        {/* Dynamic Flame */}
        <path
          d="M50 14C56 24 68 28 66 42C64 52 56 56 50 56C44 56 36 52 34 42C32 28 44 24 50 14Z"
          fill="url(#torchFire)"
        />
        <path
          d="M50 26C54 32 60 36 58 44C56 50 52 52 50 52C48 52 44 50 42 44C40 36 46 32 50 26Z"
          fill="#FEF08A"
        />

        {/* Torch Bowl */}
        <path d="M34 52H66L60 62H40L34 52Z" fill="#D97706" stroke="#FDE047" strokeWidth="1.5" />
        {/* Torch Handle */}
        <path d="M42 62H58L54 86H46L42 62Z" fill="#B45309" stroke="#F59E0B" strokeWidth="1.5" />
        <rect x="44" y="86" width="12" height="4" rx="2" fill="#78350F" />
      </svg>
    ),
  },
  {
    id: 'golden_crown',
    name: 'Vương Miện Quán Quân',
    category: 'Danh hiệu',
    description: 'Vương miện hoàng gia vàng đính ngọc lục bảo danh giá',
    recommendedFor: ['SUMMARY', 'VE_DICH'],
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#A16207" />
          </linearGradient>
        </defs>
        {/* Crown Body */}
        <polygon
          points="20,40 32,70 68,70 80,40 62,56 50,32 38,56"
          fill="url(#crownGrad)"
          stroke="#FEF08A"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Crown Base Rim */}
        <rect x="28" y="70" width="44" height="8" rx="3" fill="#A16207" stroke="#FEF08A" strokeWidth="1.5" />

        {/* Gems on Tips */}
        <circle cx="20" cy="38" r="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
        <circle cx="50" cy="30" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="80" cy="38" r="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />

        {/* Rim Jewels */}
        <circle cx="36" cy="74" r="2" fill="#3B82F6" />
        <circle cx="50" cy="74" r="2.5" fill="#EF4444" />
        <circle cx="64" cy="74" r="2" fill="#3B82F6" />
      </svg>
    ),
  },
  {
    id: 'shield_victory',
    name: 'Khiên Vàng Vinh Quang',
    category: 'Danh hiệu',
    description: 'Huy hiệu khiên hiệp sĩ mạ vàng với chữ V chiến thắng',
    recommendedFor: ['SUMMARY', 'DAU_TRI'],
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>
        {/* Outer Shield */}
        <path
          d="M50 16L78 26V52C78 68 64 80 50 86C36 80 22 68 22 52V26L50 16Z"
          fill="url(#shieldGrad)"
          stroke="#FEF08A"
          strokeWidth="3"
        />
        {/* Inner Shield */}
        <path
          d="M50 24L70 32V50C70 62 58 72 50 77C42 72 30 62 30 50V32L50 24Z"
          fill="#1E1B4B"
          stroke="#F59E0B"
          strokeWidth="1.5"
        />
        {/* Victory V */}
        <path
          d="M38 38L50 64L62 38"
          stroke="#FEF08A"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'atom_science',
    name: 'Nguyên Tử Khoa Học',
    category: 'Biểu trưng',
    description: 'Quỹ đạo 3 electron xoay quanh hạt nhân khoa học tự nhiên',
    recommendedFor: ['KHOI_DONG', 'TANG_TOC'],
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="atomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>
        {/* Orbit 1 */}
        <ellipse cx="50" cy="50" rx="36" ry="14" stroke="url(#atomGrad)" strokeWidth="2.5" transform="rotate(0 50 50)" />
        {/* Orbit 2 */}
        <ellipse cx="50" cy="50" rx="36" ry="14" stroke="url(#atomGrad)" strokeWidth="2.5" transform="rotate(60 50 50)" />
        {/* Orbit 3 */}
        <ellipse cx="50" cy="50" rx="36" ry="14" stroke="url(#atomGrad)" strokeWidth="2.5" transform="rotate(120 50 50)" />

        {/* Nucleus */}
        <circle cx="50" cy="50" r="8" fill="#F43F5E" stroke="#FEF08A" strokeWidth="2" />
        {/* Electrons */}
        <circle cx="86" cy="50" r="3.5" fill="#38BDF8" />
        <circle cx="32" cy="19" r="3.5" fill="#818CF8" />
        <circle cx="32" cy="81" r="3.5" fill="#FDE047" />
      </svg>
    ),
  },
  {
    id: 'book_open',
    name: 'Trang Sách Trí Tuệ',
    category: 'Biểu trưng',
    description: 'Quyển sách mở sáng ngời tri thức nhân loại với ánh hào quang',
    recommendedFor: ['KHOI_DONG', 'CHINH_PHUC'],
    svg: ({ className = 'w-full h-full' }) => (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
        </defs>
        {/* Rays from book */}
        <line x1="50" y1="20" x2="50" y2="12" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="38" y1="24" x2="32" y2="18" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
        <line x1="62" y1="24" x2="68" y2="18" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />

        {/* Book Left Page */}
        <path
          d="M50 36C40 32 26 34 20 38V74C26 70 40 68 50 72V36Z"
          fill="#F8FAFC"
          stroke="#0284C7"
          strokeWidth="2"
        />
        {/* Book Right Page */}
        <path
          d="M50 36C60 32 74 34 80 38V74C74 70 60 68 50 72V36Z"
          fill="#E2E8F0"
          stroke="#0284C7"
          strokeWidth="2"
        />
        {/* Lines on pages */}
        <line x1="26" y1="48" x2="44" y2="46" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="26" y1="56" x2="44" y2="54" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="56" y1="46" x2="74" y2="48" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="56" y1="54" x2="74" y2="56" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

        {/* Bookmark Ribbon */}
        <path d="M50 36V78L46 75L42 78V37" fill="#EF4444" />
      </svg>
    ),
  },
];

/**
 * Get preset logo definition by ID
 */
export function getPresetLogo(id?: string): PresetRoundLogo | undefined {
  if (!id || id === 'none') return undefined;
  return PRESET_ROUND_LOGOS.find((item) => item.id === id);
}

/**
 * Get the default recommended logo ID for a given round
 */
export function getDefaultLogoForRound(roundId: string): string {
  switch (roundId) {
    case 'KHOI_DONG':
      return 'kd_rocket';
    case 'VCNV':
      return 'vcnv_puzzle';
    case 'TANG_TOC':
      return 'tang_toc_lightning';
    case 'VE_DICH':
      return 've_dich_trophy';
    case 'CH_PHU':
      return 'ch_phu_star';
    case 'JEOPARDY':
      return 'jeopardy_grid';
    case 'MA_TRAN_KEP':
      return 'mtk_matrix';
    case 'CHINH_PHUC':
      return 'cp_mountain';
    case 'DAU_TRI':
      return 'dt_intellect';
    case 'SUMMARY':
      return 'olympia_laurel';
    default:
      return 'olympia_laurel';
  }
}

/**
 * Unified Round Logo Renderer:
 * - If `logoIdOrUrl` is 'none' or empty -> renders null
 * - If `logoIdOrUrl` matches a preset ID -> renders SVG vector
 * - If `logoIdOrUrl` is an external URL/DataURI -> renders <img>
 */
export const RoundLogoRenderer: React.FC<{
  logoIdOrUrl?: string;
  className?: string;
  alt?: string;
}> = ({ logoIdOrUrl, className = 'w-4 h-4', alt = '' }) => {
  if (!logoIdOrUrl || logoIdOrUrl === 'none') {
    return null;
  }

  const preset = getPresetLogo(logoIdOrUrl);
  if (preset) {
    return preset.svg({ className });
  }

  // Check if it's a URL or base64 image
  if (
    logoIdOrUrl.startsWith('http://') ||
    logoIdOrUrl.startsWith('https://') ||
    logoIdOrUrl.startsWith('data:') ||
    logoIdOrUrl.startsWith('/')
  ) {
    return (
      <img
        src={logoIdOrUrl}
        alt={alt}
        className={`${className} object-contain`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  return null;
};
