/**
 * Sound Registry & Sound Effect Definition File
 * Place any custom .mp3 / .wav sound files inside /public/sounds/
 */

export interface SoundDefinition {
  id: string;
  name: string;
  category: 'CHUNG' | 'KHỞI ĐỘNG' | 'VCNV' | 'TĂNG TỐC' | 'VỀ ĐÍCH' | 'CÂU HỎI PHỤ' | 'HIỆU ỨNG' | 'JEOPARDY' | 'MA_TRAN_KEP' | 'CHINH_PHUC' | 'ĐẤU TRÍ';
  fileName: string; // e.g. 'Warm-up/Warm-up_Start.mp3'
  description: string;
  synthType?: 'buzzer' | 'correct' | 'wrong' | 'tick' | 'chime' | 'star' | 'fanfare' | 'timer_start';
  canOverlay?: boolean; // If true (*), allowed to run over other sounds; if false, stops previous non-overlay sounds
  loop?: boolean; // If true, audio loops when finished
}

export const SOUND_REGISTRY: SoundDefinition[] = [
    // --- KHỞI ĐỘNG (WARM-UP) ---
  {
    id: 'Warm-up_Start',
    name: 'Khởi Động - Vào Phần Thi (*)',
    category: 'KHỞI ĐỘNG',
    fileName: 'Warm-up/Warm-up_Start.mp3',
    description: 'Phát khi admin nhấn nút Khởi động ở cột trái (*)',
    synthType: 'fanfare',
    canOverlay: true
  },
  {
    id: 'Warm-up_BeginTurn',
    name: 'Khởi Động - Nhạc Chuẩn Bị (*)',
    category: 'KHỞI ĐỘNG',
    fileName: 'Warm-up/Warm-up_BeginTurn.mp3',
    description: 'Phát khi admin nhấn nút Chạy nhạc chuẩn bị (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Warm-up_QuestionShow',
    name: 'Khởi Động - 3s Đếm Ngược (*)',
    category: 'KHỞI ĐỘNG',
    fileName: 'Warm-up/Warm-up_QuestionShow.mp3',
    description: 'Phát khi admin nhấn nút Bắt đầu 3s đếm ngược (*)',
    synthType: 'timer_start',
    canOverlay: true
  },
  {
    id: 'Warm-up_3Seconds',
    name: 'Khởi Động - Đếm Ngược 3 Giây (*)',
    category: 'KHỞI ĐỘNG',
    fileName: 'Warm-up/Warm-up_3Seconds.mp3',
    description: 'Phát khi đếm ngược 3s giành chuông lượt thi chung (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Warm-up_30Seconds',
    name: 'Khởi Động - Nhạc 30 Giây',
    category: 'KHỞI ĐỘNG',
    fileName: 'Warm-up/Warm-up_30Seconds.mp3',
    description: 'Nhạc nền lượt thi Khởi Động 30 giây',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Warm-up_45Seconds',
    name: 'Khởi Động - Nhạc 45 Giây',
    category: 'KHỞI ĐỘNG',
    fileName: 'Warm-up/Warm-up_45Seconds.mp3',
    description: 'Nhạc nền lượt thi Khởi Động 45 giây',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Warm-up_60Seconds',
    name: 'Khởi Động - Nhạc 60 Giây',
    category: 'KHỞI ĐỘNG',
    fileName: 'Warm-up/Warm-up_60Seconds.mp3',
    description: 'Nhạc nền lượt thi Khởi Động 60 giây',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Warm-up_90Seconds',
    name: 'Khởi Động - Nhạc 90 Giây',
    category: 'KHỞI ĐỘNG',
    fileName: 'Warm-up/Warm-up_90Seconds.mp3',
    description: 'Nhạc nền lượt thi Khởi Động 90 giây',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Warm-up_MainFirstHalf',
    name: 'Khởi Động - Nhạc Nửa Đầu Lượt Thi',
    category: 'KHỞI ĐỘNG',
    fileName: 'Warm-up/Warm-up_MainFirstHalf.mp3',
    description: 'Phát từ câu 1 đến nửa đầu lượt (Q4 cá nhân / Q7 chung). Lặp lại nếu hết nhạc.',
    synthType: 'chime',
    canOverlay: true,
    loop: true
  },
  {
    id: 'Warm-up_MainLastHalf',
    name: 'Khởi Động - Nhạc Nửa Sau Lượt Thi',
    category: 'KHỞI ĐỘNG',
    fileName: 'Warm-up/Warm-up_MainLastHalf.mp3',
    description: 'Phát tiếp sau nửa đầu, dừng khi câu hỏi cuối xuất hiện (Q6 cá nhân / Q12 chung). Lặp lại nếu hết nhạc.',
    synthType: 'chime',
    canOverlay: false,
    loop: true
  },
  {
    id: 'Warm-up_MainFinalQuestion',
    name: 'Khởi Động - Nhạc Câu Cuối Cùng',
    category: 'KHỞI ĐỘNG',
    fileName: 'Warm-up/Warm-up_MainFinalQuestion.mp3',
    description: 'Phát tại câu hỏi cuối cùng của lượt thi (Q6 cá nhân / Q12 chung).',
    synthType: 'chime',
    canOverlay: false
  },
  {
    id: 'Warm-up_Correct',
    name: 'Khởi Động - Đánh Giá Đúng (*)',
    category: 'KHỞI ĐỘNG',
    fileName: 'Warm-up/Warm-up_Correct.mp3',
    description: 'Phát khi thí sinh trả lời đúng (*)',
    synthType: 'correct',
    canOverlay: true
  },
  {
    id: 'Warm-up_Wrong',
    name: 'Khởi Động - Đánh Giá Sai (*)',
    category: 'KHỞI ĐỘNG',
    fileName: 'Warm-up/Warm-up_Wrong.mp3',
    description: 'Phát khi thí sinh trả lời sai (*)',
    synthType: 'wrong',
    canOverlay: true
  },
  {
    id: 'Warm-up_Buzz',
    name: 'Khởi Động - Chuông Bấm Giành Quyền (*)',
    category: 'KHỞI ĐỘNG',
    fileName: 'General/General_Buzz.mp3',
    description: 'Phát khi thí sinh bấm chuông ở lượt thi chung (*)',
    synthType: 'buzzer',
    canOverlay: true
  },
  {
    id: 'Warm-up_5Seconds',
    name: 'Khởi Động - Đếm Ngược 5 Giây (*)',
    category: 'KHỞI ĐỘNG',
    fileName: 'Warm-up/Warm-up_5Seconds.mp3',
    description: 'Phát khi đếm ngược 5s lượt chung (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Warm-up_Finish',
    name: 'Khởi Động - Kết Thúc Lượt Thi',
    category: 'KHỞI ĐỘNG',
    fileName: 'Warm-up/Warm-up_Finish.mp3',
    description: 'Phát khi kết thúc lượt thi (Dừng tất cả âm thanh khác)',
    synthType: 'fanfare',
    canOverlay: false
  },

  // --- VƯỢT CHƯỚNG NGẠI VẬT ---
  {
    id: 'Obstacle_Start',
    name: 'VCNV - Bắt Đầu Phần Thi (*)',
    category: 'VCNV',
    fileName: 'Obstacle/Obstacle_Start.mp3',
    description: 'Phát âm thanh khi admin nhấn chọn Vượt chướng ngại vật (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Obstacle_RowShow',
    name: 'VCNV - Hiển Thị Hàng Ngang (*)',
    category: 'VCNV',
    fileName: 'Obstacle/Obstacle_RowShow.mp3',
    description: 'Phát âm thanh khi hiển thị các hàng ngang (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Obstacle_RowChoose',
    name: 'VCNV - Lựa Chọn Hàng Ngang (*)',
    category: 'VCNV',
    fileName: 'Obstacle/Obstacle_RowChoose.mp3',
    description: 'Phát âm thanh khi lựa chọn hàng ngang (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Obstacle_RowThinking',
    name: 'VCNV - Đếm Ngược 15 Giây (*)',
    category: 'VCNV',
    fileName: 'Obstacle/Obstacle_RowThinking.mp3',
    description: 'Phát âm thanh khi đếm ngược 15s cho hàng ngang (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Obstacle_ShowAnswer',
    name: 'VCNV - Hiển Thị Đáp Án Thí Sinh (*)',
    category: 'VCNV',
    fileName: 'Obstacle/Obstacle_ShowAnswer.mp3',
    description: 'Phát âm thanh khi hiển thị đáp án thí sinh (*)',
    synthType: 'star',
    canOverlay: true
  },
  {
    id: 'Obstacle_RowRight',
    name: 'VCNV - Hàng Ngang Đúng',
    category: 'VCNV',
    fileName: 'Obstacle/Obstacle_RowRight.mp3',
    description: 'Phát khi hàng ngang được lật mở (có thí sinh trả lời đúng)',
    synthType: 'fanfare',
    canOverlay: false
  },
  {
    id: 'Obstacle_RowWrong',
    name: 'VCNV - Hàng Ngang / CNV Sai',
    category: 'VCNV',
    fileName: 'Obstacle/Obstacle_RowWrong.mp3',
    description: 'Phát khi không ai trả lời đúng hàng ngang hoặc thí sinh trả lời sai CNV',
    synthType: 'buzzer',
    canOverlay: false
  },
  {
    id: 'Obstacle_PictureShow',
    name: 'VCNV - Lật Mảnh Ghép (*)',
    category: 'VCNV',
    fileName: 'Obstacle/Obstacle_PictureShow.mp3',
    description: 'Phát khi lật mở một mảnh ghép hình ảnh (*)',
    synthType: 'star',
    canOverlay: true
  },
  {
    id: 'Obstacle_Buzz',
    name: 'VCNV - Chuông Trả Lời CNV (*)',
    category: 'VCNV',
    fileName: 'Obstacle/Obstacle_Buzz.mp3',
    description: 'Phát khi thí sinh bấm chuông trả lời CNV (*)',
    synthType: 'buzzer',
    canOverlay: true
  },
  {
    id: 'Obstacle_Right',
    name: 'VCNV - Đúng Chướng Ngại Vật (*)',
    category: 'VCNV',
    fileName: 'Obstacle/Obstacle_Right.mp3',
    description: 'Phát khi thí sinh trả lời đúng Chướng Ngại Vật (*)',
    synthType: 'fanfare',
    canOverlay: true
  },

  // --- TĂNG TỐC ---
  {
    id: 'Acceleration_Start',
    name: 'Tăng Tốc - Bắt Đầu Phần Thi (*)',
    category: 'TĂNG TỐC',
    fileName: 'Acceleration/Acceleration_Start.mp3',
    description: 'Phát âm thanh khi admin nhấn chọn Tăng tốc ở cột trái (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Acceleration_QuestionShow',
    name: 'Tăng Tốc - Hiển Thị Câu Hỏi (*)',
    category: 'TĂNG TỐC',
    fileName: 'Acceleration/Acceleration_QuestionShow.mp3',
    description: 'Phát âm thanh khi hiển thị câu hỏi (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Acceleration_10Seconds',
    name: 'Tăng Tốc - Đếm Ngược 10 Giây (*)',
    category: 'TĂNG TỐC',
    fileName: 'Acceleration/Acceleration_10Seconds.mp3',
    description: 'Phát âm thanh khi tính giờ câu hỏi có mức thời gian 10 giây (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Acceleration_20Seconds',
    name: 'Tăng Tốc - Đếm Ngược 20 Giây (*)',
    category: 'TĂNG TỐC',
    fileName: 'Acceleration/Acceleration_20Seconds.mp3',
    description: 'Phát âm thanh khi tính giờ câu hỏi có mức thời gian 20 giây (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Acceleration_30Seconds',
    name: 'Tăng Tốc - Đếm Ngược 30 Giây (*)',
    category: 'TĂNG TỐC',
    fileName: 'Acceleration/Acceleration_30Seconds.mp3',
    description: 'Phát âm thanh khi tính giờ câu hỏi có mức thời gian 30 giây (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Acceleration_40Seconds',
    name: 'Tăng Tốc - Đếm Ngược 40 Giây (*)',
    category: 'TĂNG TỐC',
    fileName: 'Acceleration/Acceleration_40Seconds.mp3',
    description: 'Phát âm thanh khi tính giờ câu hỏi có mức thời gian 40 giây (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Acceleration_AnswerShow',
    name: 'Tăng Tốc - Hiển Thị Đáp Án Thí Sinh (*)',
    category: 'TĂNG TỐC',
    fileName: 'Acceleration/Acceleration_AnswerShow.mp3',
    description: 'Phát âm thanh khi hiển thị đáp án thí sinh (*)',
    synthType: 'star',
    canOverlay: true
  },
  {
    id: 'Acceleration_Buzz',
    name: 'Tăng Tốc - Chuông Bấm Giành Quyền (*)',
    category: 'TĂNG TỐC',
    fileName: 'General/General_Buzz.mp3',
    description: 'Phát khi thí sinh bấm chuông giành quyền ở Tăng Tốc Cải Tiến (*)',
    synthType: 'buzzer',
    canOverlay: true
  },
  {
    id: 'Acceleration_Right',
    name: 'Tăng Tốc - Trả Lời Đúng (*)',
    category: 'TĂNG TỐC',
    fileName: 'Acceleration/Acceleration_Right.mp3',
    description: 'Phát khi có thí sinh trả lời đúng (*)',
    synthType: 'fanfare',
    canOverlay: true
  },
  {
    id: 'Acceleration_Wrong',
    name: 'Tăng Tốc - Không Ai Trả Lời Đúng (*)',
    category: 'TĂNG TỐC',
    fileName: 'Acceleration/Acceleration_Wrong.mp3',
    description: 'Phát khi không ai trả lời đúng (*)',
    synthType: 'buzzer',
    canOverlay: true
  },

  // --- VỀ ĐÍCH (FOLDER: Finish) ---
  {
    id: 'Finish_Start',
    name: 'Về Đích - Bắt Đầu Phần Thi (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_Start.mp3',
    description: 'Phát âm thanh khi admin nhấn vào nút Về đích ở cột trái (*)',
    synthType: 'fanfare',
    canOverlay: true
  },
  {
    id: 'Finish_UserStart',
    name: 'Về Đích - Chọn Thí Sinh VĐ (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_UserStart.mp3',
    description: 'Phát âm thanh khi lựa chọn thí sinh VĐ (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Finish_PackShow',
    name: 'Về Đích - Hiển Thị Bảng Lựa Chọn Câu Hỏi (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_PackShow.mp3',
    description: 'Phát âm thanh khi hiển thị bảng lựa chọn câu hỏi (*)',
    synthType: 'star',
    canOverlay: true
  },
  {
    id: 'Finish_Choice',
    name: 'Về Đích - Chọn Mức Điểm Câu Hỏi (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_Choice.mp3',
    description: 'Phát âm thanh khi lựa chọn câu hỏi 20/30 (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Finish_PackChoose',
    name: 'Về Đích - Chốt Gói Điểm (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_PackChoose.mp3',
    description: 'Phát âm thanh khi chốt gói điểm, hiển thị giao diện chính (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Finish_StarChoose',
    name: 'Về Đích - Chọn Ngôi Sao Hy Vọng (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_StarChoose.mp3',
    description: 'Phát âm thanh khi chọn ngôi sao hy vọng (*)',
    synthType: 'star',
    canOverlay: true
  },
  {
    id: 'Finish_10Seconds',
    name: 'Về Đích - Đếm Ngược 10 Giây (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_10Seconds.mp3',
    description: 'Phát âm thanh khi tính giờ câu hỏi 10 điểm (10s) (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Finish_15Seconds',
    name: 'Về Đích - Đếm Ngược 15 Giây (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_15Seconds.mp3',
    description: 'Phát âm thanh khi tính giờ câu hỏi có mức thời gian 15 giây (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Finish_20Seconds',
    name: 'Về Đích - Đếm Ngược 20 Giây (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_20Seconds.mp3',
    description: 'Phát âm thanh khi tính giờ câu hỏi có mức thời gian 20 giây (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Finish_30Seconds',
    name: 'Về Đích - Đếm Ngược 30 Giây (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_30Seconds.mp3',
    description: 'Phát âm thanh khi tính giờ câu hỏi 40 điểm (30s) (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Finish_Practice20Seconds',
    name: 'Về Đích - Thực Hành 20 Giây (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_Practice20Seconds.mp3',
    description: 'Phát âm thanh thực hành 20 giây (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Finish_Practice30Seconds',
    name: 'Về Đích - Thực Hành 30 Giây (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_Practice30Seconds.mp3',
    description: 'Phát âm thanh thực hành 30 giây (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Finish_Practice45Seconds',
    name: 'Về Đích - Thực Hành 45 Giây (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_Practice45Seconds.mp3',
    description: 'Phát âm thanh thực hành 45 giây (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Finish_Practice60Seconds',
    name: 'Về Đích - Thực Hành 60 Giây (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_Practice60Seconds.mp3',
    description: 'Phát âm thanh thực hành 60 giây (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Finish_Practice90Seconds',
    name: 'Về Đích - Thực Hành 90 Giây (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_Practice90Seconds.mp3',
    description: 'Phát âm thanh thực hành 90 giây (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Finish_5Seconds',
    name: 'Về Đích - Đếm Ngược 5s Giành Quyền Trả Lời',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_5Seconds.mp3',
    description: 'Phát âm thanh khi đếm ngược 5 giây giành quyền trả lời',
    synthType: 'buzzer'
  },
  {
    id: 'Finish_Buzz',
    name: 'Về Đích - Bấm Chuông (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'General/General_Buzz.mp3',
    description: 'Phát khi có thí sinh bấm chuông (*)',
    synthType: 'buzzer',
    canOverlay: true
  },
  {
    id: 'Finish_Right',
    name: 'Về Đích - Trả Lời Đúng (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_Right.mp3',
    description: 'Phát khi có thí sinh trả lời đúng (*)',
    synthType: 'fanfare',
    canOverlay: true
  },
  {
    id: 'Finish_Wrong',
    name: 'Về Đích - Không Ai Trả Lời Đúng (*)',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_Wrong.mp3',
    description: 'Phát khi không ai trả lời đúng (*)',
    synthType: 'buzzer',
    canOverlay: true
  },
  {
    id: 'Finish_Finish',
    name: 'Về Đích - Hoàn Thành Lượt Thi',
    category: 'VỀ ĐÍCH',
    fileName: 'Finish/Finish_Finish.mp3',
    description: 'Phát khi thí sinh hoàn thành lượt thi',
    synthType: 'fanfare'
  },

  // --- CÂU HỎI PHỤ (FOLDER: Additional) ---
  {
    id: 'Additional_Start',
    name: 'Câu Hỏi Phụ - Vào Phần Thi (*)',
    category: 'CÂU HỎI PHỤ',
    fileName: 'Additional/Additional_Start.mp3',
    description: 'Phát âm thanh khi admin nhấn vào nút “CHP” ở cột trái trên giao diện admin (*)',
    synthType: 'fanfare',
    canOverlay: true
  },
  {
    id: 'Additional_QuestionShow',
    name: 'Câu Hỏi Phụ - Hiển Thị Câu Hỏi (*)',
    category: 'CÂU HỎI PHỤ',
    fileName: 'Additional/Additional_QuestionShow.mp3',
    description: 'Phát âm thanh khi hiển thị câu hỏi (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Additional_15Seconds',
    name: 'Câu Hỏi Phụ - Tính Giờ 15s (*)',
    category: 'CÂU HỎI PHỤ',
    fileName: 'Additional/Additional_15Seconds.mp3',
    description: 'Phát âm thanh khi tính giờ (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Additional_10Seconds',
    name: 'Câu Hỏi Phụ - Tính Giờ 10s (*)',
    category: 'CÂU HỎI PHỤ',
    fileName: 'Additional/Additional_10Seconds.mp3',
    description: 'Phát âm thanh khi tính giờ 10s vòng luân lưu (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'Additional_Buzz',
    name: 'Câu Hỏi Phụ - Chuông Bấm (*)',
    category: 'CÂU HỎI PHỤ',
    fileName: 'General/General_Buzz.mp3',
    description: 'Phát khi có thí sinh bấm chuông (*)',
    synthType: 'buzzer',
    canOverlay: true
  },
  {
    id: 'Additional_Correct',
    name: 'Câu Hỏi Phụ - Trả Lời Đúng (*)',
    category: 'CÂU HỎI PHỤ',
    fileName: 'Additional/Additional_Correct.mp3',
    description: 'Phát khi có thí sinh trả lời đúng (*)',
    synthType: 'fanfare',
    canOverlay: true
  },
  {
    id: 'Additional_Right',
    name: 'Câu Hỏi Phụ - Trả Lời Đúng (*)',
    category: 'CÂU HỎI PHỤ',
    fileName: 'Additional/Additional_Correct.mp3',
    description: 'Phát khi có thí sinh trả lời đúng (*)',
    synthType: 'fanfare',
    canOverlay: true
  },
  {
    id: 'Additional_Wrong',
    name: 'Câu Hỏi Phụ - Trả Lời Sai (*)',
    category: 'CÂU HỎI PHỤ',
    fileName: 'Additional/Additional_Wrong.mp3',
    description: 'Phát khi có thí sinh trả lời sai câu hỏi phụ (*)',
    synthType: 'wrong',
    canOverlay: true
  },
  {
    id: 'Additional_Win',
    name: 'Câu Hỏi Phụ - Thắng Vòng (*)',
    category: 'CÂU HỎI PHỤ',
    fileName: 'Additional/Additional_Win.mp3',
    description: 'Phát khi có thí sinh chiến thắng vòng câu hỏi phụ (*)',
    synthType: 'fanfare',
    canOverlay: true
  },

  // --- PHẦN THI PHỤ - JEOPARDY! ---
  {
    id: 'Jeopardy_Start',
    name: 'Jeopardy - Nhạc Bắt Đầu (*)',
    category: 'JEOPARDY',
    fileName: 'Jeopardy/Jeopardy_Start.mp3',
    description: 'Phát khi nhấn nút Jeopardy trên Admin Panel (*)',
    synthType: 'fanfare',
    canOverlay: true
  },
  {
    id: 'Jeopardy_ShowBoard',
    name: 'Jeopardy - Nhạc Hiển Thị Bảng (*)',
    category: 'JEOPARDY',
    fileName: 'Jeopardy/Jeopardy_ShowBoard.mp3',
    description: 'Phát khi nhấn Hiển Thị Bảng (*)',
    synthType: 'fanfare',
    canOverlay: true
  },
  {
    id: 'Jeopardy_ClueShow',
    name: 'Jeopardy - Nhạc Hiển Thị Gợi Ý (*)',
    category: 'JEOPARDY',
    fileName: 'Jeopardy/Jeopardy_ClueShow.mp3',
    description: 'Phát khi admin chọn ô gợi ý (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Jeopardy_Finish',
    name: 'Jeopardy - Nhạc Kết Thúc (*)',
    category: 'JEOPARDY',
    fileName: 'Jeopardy/Jeopardy_Finish.mp3',
    description: 'Phát khi kết thúc phần thi Jeopardy (*)',
    synthType: 'fanfare',
    canOverlay: true
  },
  {
    id: 'Jeopardy_End5Seconds',
    name: 'Jeopardy - Âm Thanh Hết 5 Giây (*)',
    category: 'JEOPARDY',
    fileName: 'Jeopardy/Jeopardy_End5Seconds.mp3',
    description: 'Phát khi hết 5 giây đếm ngược chuông (*)',
    synthType: 'wrong',
    canOverlay: true
  },

  // --- MA TRẬN KÉP (GRIDLOCKED) ---
  {
    id: 'Gridlocked_Start',
    name: 'Ma Trận Kép - Vào Vòng Thi (*)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_Start.mp3',
    description: 'Phát nhạc khi admin nhấn vào nút “Ma trận kép” trên điều khiển admin (*)',
    synthType: 'fanfare',
    canOverlay: true
  },
  {
    id: 'Gridlocked_Ready',
    name: 'Ma Trận Kép - Nhạc Chuẩn Bị (*)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_Ready.mp3',
    description: 'Phát nhạc khi admin nhấn vào nút “Chuẩn bị” (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Gridlocked_MainTime',
    name: 'Ma Trận Kép - Nhạc Bắt Đầu (Gốc) (*)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_MainTime.mp3',
    description: 'Phát nhạc khi admin nhấn vào nút “Bắt đầu” (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Gridlocked_MainTime90Seconds',
    name: 'Ma Trận Kép - Nhạc Bắt Đầu (1p30s) (*)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_MainTime90Seconds.mp3',
    description: 'Phát nhạc đếm ngược 90 giây khi admin bấm Bắt đầu (1p30s) (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Gridlocked_MainTime120Seconds',
    name: 'Ma Trận Kép - Nhạc Bắt Đầu (2p) (*)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_MainTime120Seconds.mp3',
    description: 'Phát nhạc đếm ngược 120 giây khi admin bấm Bắt đầu (2p) (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Gridlocked_MainTime150Seconds',
    name: 'Ma Trận Kép - Nhạc Bắt Đầu (2p30s) (*)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_MainTime150Seconds.mp3',
    description: 'Phát nhạc đếm ngược 150 giây khi admin bấm Bắt đầu (2p30s) (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Gridlocked_MainTime180Seconds',
    name: 'Ma Trận Kép - Nhạc Bắt Đầu (3p) (*)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_MainTime180Seconds.mp3',
    description: 'Phát nhạc đếm ngược 180 giây khi admin bấm Bắt đầu (3p) (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'Gridlocked_Correct',
    name: 'Ma Trận Kép - Trả Lời Đúng (*)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_Correct.mp3',
    description: 'Phát nhạc khi thí sinh trả lời đúng (*)',
    synthType: 'correct',
    canOverlay: true
  },
  {
    id: 'Gridlocked_Pass',
    name: 'Ma Trận Kép - Bỏ Qua (*)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_Pass.mp3',
    description: 'Phát nhạc khi thí sinh bấm Bỏ qua (*)',
    synthType: 'buzzer',
    canOverlay: true
  },
  {
    id: 'Gridlocked_Winner',
    name: 'Ma Trận Kép - Hoàn Thành (Thắng Cuộc) (*)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_Winner.mp3',
    description: 'Phát nhạc khi thí sinh hoàn thành trước khi hết 3p (dừng ngay MainTime) (*)',
    synthType: 'fanfare',
    canOverlay: true
  },
  {
    id: 'Gridlocked_End',
    name: 'Ma Trận Kép - Kết Thúc Vòng Thi (*)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_End.mp3',
    description: 'Phát nhạc khi admin bấm kết thúc lượt thi (*)',
    synthType: 'fanfare',
    canOverlay: true
  },

  // Aliases for backward compatibility
  {
    id: 'MaTranKep_Start',
    name: 'Ma Trận Kép - Vào Vòng Thi (Alias)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_Start.mp3',
    description: 'Alias cho Gridlocked_Start',
    synthType: 'fanfare',
    canOverlay: true
  },
  {
    id: 'MaTranKep_BeginTurn',
    name: 'Ma Trận Kép - Nhạc Chuẩn Bị (Alias)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_Ready.mp3',
    description: 'Alias cho Gridlocked_Ready',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'MaTranKep_Correct',
    name: 'Ma Trận Kép - Trả Lời Đúng (Alias)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_Correct.mp3',
    description: 'Alias cho Gridlocked_Correct',
    synthType: 'correct',
    canOverlay: true
  },
  {
    id: 'MaTranKep_Partial',
    name: 'Ma Trận Kép - Trả Lời Đúng 1/2 Ô (*)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_Correct.mp3',
    description: 'Phát khi thí sinh chọn đúng 1 trong 2 đáp án (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'MaTranKep_Wrong',
    name: 'Ma Trận Kép - Trả Lời Sai (*)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_Pass.mp3',
    description: 'Phát khi thí sinh chọn sai (*)',
    synthType: 'wrong',
    canOverlay: true
  },
  {
    id: 'MaTranKep_Skip',
    name: 'Ma Trận Kép - Bỏ Qua (Alias)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_Pass.mp3',
    description: 'Alias cho Gridlocked_Pass',
    synthType: 'buzzer',
    canOverlay: true
  },
  {
    id: 'MaTranKep_Finish',
    name: 'Ma Trận Kép - Nhạc Kết Thúc (Alias)',
    category: 'MA_TRAN_KEP',
    fileName: 'Gridlocked/Gridlocked_End.mp3',
    description: 'Alias cho Gridlocked_End',
    synthType: 'fanfare',
    canOverlay: true
  },

  // --- TỔNG KẾT & CHỦ ĐỀ KHÁC ---
  {
    id: 'summary_fanfare',
    name: 'Tổng Kết - Trao Giải & Vinh Danh',
    category: 'HIỆU ỨNG',
    fileName: 'HieuUng/summary_fanfare.mp3',
    description: 'Nhạc chiến thắng vinh danh quán quân chung cuộc',
    synthType: 'fanfare'
  },

  // --- ÂM THANH DÙNG CHUNG (FOLDER: General) ---
  {
    id: 'General_Buzz',
    name: 'Tiếng Chuông Bấm Giành Quyền (*)',
    category: 'CHUNG',
    fileName: 'General/General_Buzz.mp3',
    description: 'Phát âm thanh chuông bấm giành quyền chung cho tất cả các vòng (*)',
    synthType: 'buzzer',
    canOverlay: true
  },
  {
    id: 'General_Ambience',
    name: 'Nhạc Nền Ambience CHP (*)',
    category: 'CÂU HỎI PHỤ',
    fileName: 'General/General_Ambience.mp3',
    description: 'Nhạc nền phát lặp lại ở 50% âm lượng trong vòng Câu hỏi phụ (luật Cải tiến & Luân lưu) (*)',
    synthType: 'chime',
    canOverlay: true,
    loop: true
  },
  {
    id: 'General_ScoreSummary',
    name: 'Tổng Kết Điểm Từng Vòng',
    category: 'CHUNG',
    fileName: 'General/General_ScoreSummary.mp3',
    description: 'Phát âm thanh tổng kết điểm từng vòng khi admin nhấn nút “Tổng kết điểm từng vòng”',
    synthType: 'fanfare',
    canOverlay: false
  },
  {
    id: 'General_First',
    name: 'Phát Điểm - Hạng Nhất',
    category: 'CHUNG',
    fileName: 'General/General_First.mp3',
    description: 'Phát điểm cho vị trí thứ nhất trong tổng kết cuối trận',
    synthType: 'fanfare',
    canOverlay: false
  },
  {
    id: 'General_Second',
    name: 'Phát Điểm - Hạng Nhì',
    category: 'CHUNG',
    fileName: 'General/General_Second.mp3',
    description: 'Phát điểm cho vị trí thứ nhì trong tổng kết cuối trận',
    synthType: 'chime',
    canOverlay: false
  },
  {
    id: 'General_Third',
    name: 'Phát Điểm - Hạng Ba',
    category: 'CHUNG',
    fileName: 'General/General_Third.mp3',
    description: 'Phát điểm cho vị trí thứ ba trong tổng kết cuối trận',
    synthType: 'chime',
    canOverlay: false
  },
  {
    id: 'General_Fourth',
    name: 'Phát Điểm - Hạng Tư',
    category: 'CHUNG',
    fileName: 'General/General_Fourth.mp3',
    description: 'Phát điểm cho vị trí thứ tư trong tổng kết cuối trận',
    synthType: 'chime',
    canOverlay: false
  },
  {
    id: 'General_AwardCelebration',
    name: 'Trao Giải & Ăn Mừng',
    category: 'CHUNG',
    fileName: 'General/General_AwardCelebration.mp3',
    description: 'Nhạc trao giải và ăn mừng thắng cuộc',
    synthType: 'fanfare',
    canOverlay: false
  },
  {
    id: 'General_Space',
    name: 'Dấu Ba Chấm / Chỗ Trống (*)',
    category: 'CHUNG',
    fileName: 'General/General_Space.mp3',
    description: 'Phát âm thanh dấu ba chấm / chỗ trống (*)',
    synthType: 'tick',
    canOverlay: true
  },
  {
    id: 'General_Intro',
    name: 'Nhạc Hiệu Cuộc Thi (*)',
    category: 'CHUNG',
    fileName: 'General/General_Intro.mp3',
    description: 'Phát nhạc hiệu cuộc thi trong phòng chờ (*)',
    synthType: 'fanfare',
    canOverlay: true
  },
  {
    id: 'General_Entrance',
    name: 'Nhạc Mở Đầu Cuộc Thi (*)',
    category: 'CHUNG',
    fileName: 'General/General_Entrance.mp3',
    description: 'Phát nhạc mở đầu cuộc thi trong phòng chờ (*)',
    synthType: 'fanfare',
    canOverlay: true
  },
  {
    id: 'General_IntroduceContestant',
    name: 'Giới Thiệu Thí Sinh',
    category: 'CHUNG',
    fileName: 'General/General_IntroduceContestant.mp3',
    description: 'Giới thiệu thí sinh tham gia trận đấu',
    synthType: 'fanfare',
    canOverlay: false
  },
  {
    id: 'General_Supervisior_1',
    name: 'Ban Cố Vấn (1) (*)',
    category: 'CHUNG',
    fileName: 'General/General_Supervisior(1).mp3',
    description: 'Âm thanh giới thiệu thành viên Ban cố vấn 1 (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'General_Supervisior_2',
    name: 'Ban Cố Vấn (2) (*)',
    category: 'CHUNG',
    fileName: 'General/General_Supervisior(2).mp3',
    description: 'Âm thanh giới thiệu thành viên Ban cố vấn 2 (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'General_Supervisior_3',
    name: 'Ban Cố Vấn (3) (*)',
    category: 'CHUNG',
    fileName: 'General/General_Supervisior(3).mp3',
    description: 'Âm thanh giới thiệu thành viên Ban cố vấn 3 (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'General_Supervisior_4',
    name: 'Ban Cố Vấn (4) (*)',
    category: 'CHUNG',
    fileName: 'General/General_Supervisior(4).mp3',
    description: 'Âm thanh giới thiệu thành viên Ban cố vấn 4 (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'General_Supervisior_5',
    name: 'Ban Cố Vấn (5) (*)',
    category: 'CHUNG',
    fileName: 'General/General_Supervisior(5).mp3',
    description: 'Âm thanh giới thiệu thành viên Ban cố vấn 5 (*)',
    synthType: 'chime',
    canOverlay: true
  },
  {
    id: 'General_RoundIntro',
    name: 'Nhạc Hiệu Vòng Thi (*)',
    category: 'CHUNG',
    fileName: 'General/General_RoundIntro.mp3',
    description: 'Phát nhạc hiệu vòng thi trong phòng chờ (*)',
    synthType: 'fanfare',
    canOverlay: true
  },

  // --- CHINH PHỤC (BRAINIEST) ---
  {
    id: 'Brainiest_Start',
    name: 'Chinh Phục - Bắt Đầu Vòng Thi',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_Start.mp3',
    description: 'Phát nhạc khi admin nhấn vào nút “Chinh phục” trên điều khiển admin',
    synthType: 'fanfare',
    canOverlay: true
  },
  {
    id: 'Brainiest_Bed1',
    name: 'Chinh Phục - Nhạc Nền 1 (*)',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_Bed1.mp3',
    description: 'Nhạc nền 1 (30% âm lượng), phát sau khi nhạc Start kết thúc, lặp lại liên tục (*)',
    synthType: 'chime',
    canOverlay: true,
    loop: true
  },
  {
    id: 'Brainiest_Bed2',
    name: 'Chinh Phục - Nhạc Nền 2 (*)',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_Bed2.mp3',
    description: 'Nhạc nền 2 (30% âm lượng), phát sau khi nhạc Start_Turn kết thúc, lặp lại liên tục (*)',
    synthType: 'chime',
    canOverlay: true,
    loop: true
  },
  {
    id: 'Brainiest_CodebreakerClue',
    name: 'Chinh Phục - Mật Mã & Gợi Ý GMĐT',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_CodebreakerClue.mp3',
    description: 'Phát lần 1 khi hiển thị mật mã, phát lần 2 khi hiển thị gợi ý',
    synthType: 'chime',
    canOverlay: false
  },
  {
    id: 'Brainiest_CodebreakerTimer',
    name: 'Chinh Phục - Tính Giờ GMĐT',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_CodebreakerTimer.mp3',
    description: 'Phát khi tiến hành tính giờ vòng GMĐT, lặp lại nếu hết nhạc',
    synthType: 'chime',
    canOverlay: false,
    loop: true
  },
  {
    id: 'Brainiest_CodebreakerEnd',
    name: 'Chinh Phục - Kết Thúc GMĐT',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_CodebreakerEnd.mp3',
    description: 'Phát khi phần thi GMĐT kết thúc hoặc admin chuyển sang công bố đáp án',
    synthType: 'fanfare',
    canOverlay: false
  },
  {
    id: 'Brainiest_First',
    name: 'Chinh Phục - Thứ Tự 1 (Màu Đỏ)',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_First.mp3',
    description: 'Phát thứ tự thi đấu lượt 1 của thí sinh',
    synthType: 'chime',
    canOverlay: false
  },
  {
    id: 'Brainiest_Second',
    name: 'Chinh Phục - Thứ Tự 2 (Màu Vàng)',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_Second.mp3',
    description: 'Phát thứ tự thi đấu lượt 2 của thí sinh',
    synthType: 'chime',
    canOverlay: false
  },
  {
    id: 'Brainiest_Third',
    name: 'Chinh Phục - Thứ Tự 3 (Màu Xanh Dương)',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_Third.mp3',
    description: 'Phát thứ tự thi đấu lượt 3 của thí sinh',
    synthType: 'chime',
    canOverlay: false
  },
  {
    id: 'Brainiest_Fourth',
    name: 'Chinh Phục - Thứ Tự 4 (Màu Xanh Lá)',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_Fourth.mp3',
    description: 'Phát thứ tự thi đấu lượt 4 của thí sinh',
    synthType: 'chime',
    canOverlay: false
  },
  {
    id: 'Brainiest_ShowBoard',
    name: 'Chinh Phục - 10 Giây Hiện Ô Bảng',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_ShowBoard.mp3',
    description: 'Phát khi admin bấm nút “10s hiện ô”',
    synthType: 'chime',
    canOverlay: false
  },
  {
    id: 'Brainiest_StartTurn',
    name: 'Chinh Phục - Bắt Đầu Lượt Thi',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_StartTurn.mp3',
    description: 'Phát khi admin bấm nút “Bắt đầu lượt”',
    synthType: 'chime',
    canOverlay: false
  },
  {
    id: 'Brainiest_Choose',
    name: 'Chinh Phục - Chọn Ô Câu Hỏi',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_Choose.mp3',
    description: 'Phát khi chọn ô câu hỏi trên bảng Chinh Phục',
    synthType: 'chime',
    canOverlay: false
  },
  {
    id: 'Brainiest_ShowQuestion',
    name: 'Chinh Phục - Hiển Thị Câu Hỏi',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_ShowQuestion.mp3',
    description: 'Phát khi admin hiển thị câu hỏi trên các giao diện',
    synthType: 'chime',
    canOverlay: false
  },
  {
    id: 'Brainiest_10Seconds',
    name: 'Chinh Phục - Đếm Ngược 10 Giây (Truyền Thống)',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_10Seconds.mp3',
    description: 'Phát khi admin tính giờ 10s luật truyền thống',
    synthType: 'tick',
    canOverlay: false
  },
  {
    id: 'Brainiest_Correct',
    name: 'Chinh Phục - Trả Lời Đúng',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_Correct.mp3',
    description: 'Phát khi trả lời đúng câu hỏi Chinh Phục',
    synthType: 'correct',
    canOverlay: false
  },
  {
    id: 'Brainiest_Incorrect',
    name: 'Chinh Phục - Trả Lời Sai',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_Incorrect.mp3',
    description: 'Phát khi trả lời sai câu hỏi Chinh Phục',
    synthType: 'wrong',
    canOverlay: false
  },
  {
    id: 'Brainiest_End',
    name: 'Chinh Phục - Kết Thúc Vòng Thi',
    category: 'CHINH_PHUC',
    fileName: 'Brainiest/Brainiest_End.mp3',
    description: 'Phát khi admin bấm “Kết thúc vòng thi”',
    synthType: 'fanfare',
    canOverlay: false
  },

  // --- ĐẤU TRÍ (UNIVERSITY CHALLENGE / UC) ---
  {
    id: 'UC_Start',
    name: 'Đấu Trí - Vào Vòng Thi (UC_Start) (*)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_Start.mp3',
    description: 'Phát nhạc khi controller nhấn vào nút “Đấu trí” trên điều khiển admin (*)',
    synthType: 'fanfare',
    canOverlay: true,
    loop: false
  },
  {
    id: 'UC_Begin',
    name: 'Đấu Trí - Nhạc Chuẩn Bị (UC_Begin) (*)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_Begin.mp3',
    description: 'Phát khi bấm nút “Chuẩn bị” (*)',
    synthType: 'chime',
    canOverlay: true,
    loop: false
  },
  {
    id: 'UC_Reminder',
    name: 'Đấu Trí - Nhắc Nhở 3:03s / Còn 3 Câu (UC_Reminder) (*)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_Reminder.mp3',
    description: 'Phát khi còn 3:03 giây trên đồng hồ hoặc còn lại 3 câu hỏi chính (*)',
    synthType: 'chime',
    canOverlay: true,
    loop: false
  },
  {
    id: 'UC_Last3Minutes',
    name: 'Đấu Trí - 3 Phút Cuối (UC_Last3Minutes) (*)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_Last3Minutes.mp3',
    description: 'Phát khi còn 3 phút trên đồng hồ (*)',
    synthType: 'timer_start',
    canOverlay: true,
    loop: false
  },
  {
    id: 'UC_End',
    name: 'Đấu Trí - Hết Thời Gian / Kết Thúc (UC_End) (*)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_End.mp3',
    description: 'Phát khi hết thời gian hoặc kết thúc vòng thi (*)',
    synthType: 'fanfare',
    canOverlay: true,
    loop: false
  },
  {
    id: 'UC_CorrectMain',
    name: 'Đấu Trí - Đúng Câu Chính (UC_CorrectMain) (*)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_CorrectMain.mp3',
    description: 'Phát khi thí sinh trả lời đúng câu hỏi chính (*)',
    synthType: 'correct',
    canOverlay: true,
    loop: false
  },
  {
    id: 'UC_CorrectBonus',
    name: 'Đấu Trí - Đúng Câu Thưởng (UC_CorrectBonus) (*)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_CorrectBonus.mp3',
    description: 'Phát khi thí sinh trả lời đúng câu hỏi thưởng (*)',
    synthType: 'correct',
    canOverlay: true,
    loop: false
  },
  {
    id: 'UC_Wrong',
    name: 'Đấu Trí - Trả Lời Sai (UC_Wrong) (*)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_Wrong.mp3',
    description: 'Phát khi thí sinh trả lời sai (*)',
    synthType: 'wrong',
    canOverlay: true,
    loop: false
  },
  // Aliases for compatibility
  {
    id: 'DauTri_Ready',
    name: 'Đấu Trí - Nhạc Chuẩn Bị (Alias -> UC_Begin)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_Begin.mp3',
    description: 'Phát khi bấm nút Chuẩn bị (Alias)',
    synthType: 'chime',
    canOverlay: true,
    loop: false
  },
  {
    id: 'DT_Ready',
    name: 'Đấu Trí - Nhạc Chuẩn Bị (Alias)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_Begin.mp3',
    description: 'Phát nhạc chuẩn bị cho vòng thi Đấu Trí (Alias)',
    synthType: 'chime',
    canOverlay: true,
    loop: false
  },
  {
    id: 'DauTri_Start',
    name: 'Đấu Trí - Bắt Đầu Phần Thi (Alias -> UC_Start)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_Start.mp3',
    description: 'Phát khi bắt đầu vòng Đấu trí',
    synthType: 'fanfare',
    canOverlay: true,
    loop: false
  },
  {
    id: 'DT_Start',
    name: 'Đấu Trí - Bắt Đầu Phần Thi (Alias)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_Start.mp3',
    description: 'Phát khi bắt đầu vòng Đấu trí (Alias)',
    synthType: 'fanfare',
    canOverlay: true,
    loop: false
  },
  {
    id: 'DauTri_Buzz',
    name: 'Đấu Trí - Tiếng Chuông Bấm',
    category: 'ĐẤU TRÍ',
    fileName: 'Obstacle/Obstacle_Buzz.mp3',
    description: 'Phát khi thí sinh bấm chuông giành quyền trả lời',
    synthType: 'buzzer',
    canOverlay: true,
    loop: false
  },
  {
    id: 'DT_Buzz',
    name: 'Đấu Trí - Tiếng Chuông Bấm (Alias)',
    category: 'ĐẤU TRÍ',
    fileName: 'Obstacle/Obstacle_Buzz.mp3',
    description: 'Phát khi thí sinh bấm chuông giành quyền trả lời (Alias)',
    synthType: 'buzzer',
    canOverlay: true,
    loop: false
  },
  {
    id: 'DauTri_Correct',
    name: 'Đấu Trí - Trả Lời Đúng (Alias -> UC_CorrectMain)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_CorrectMain.mp3',
    description: 'Phát khi thí sinh trả lời đúng câu hỏi chính (Alias)',
    synthType: 'correct',
    canOverlay: true,
    loop: false
  },
  {
    id: 'DT_Right',
    name: 'Đấu Trí - Trả Lời Đúng (Alias -> UC_CorrectMain)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_CorrectMain.mp3',
    description: 'Phát khi thí sinh trả lời đúng (Alias)',
    synthType: 'correct',
    canOverlay: true,
    loop: false
  },
  {
    id: 'DauTri_CorrectBonus',
    name: 'Đấu Trí - Đúng Câu Thưởng (Alias -> UC_CorrectBonus)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_CorrectBonus.mp3',
    description: 'Phát khi thí sinh trả lời đúng câu hỏi thưởng (Alias)',
    synthType: 'correct',
    canOverlay: true,
    loop: false
  },
  {
    id: 'DauTri_Wrong',
    name: 'Đấu Trí - Trả Lời Sai (Alias -> UC_Wrong)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_Wrong.mp3',
    description: 'Phát khi thí sinh trả lời sai câu hỏi (Alias)',
    synthType: 'wrong',
    canOverlay: true,
    loop: false
  },
  {
    id: 'DT_Wrong',
    name: 'Đấu Trí - Trả Lời Sai (Alias -> UC_Wrong)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_Wrong.mp3',
    description: 'Phát khi thí sinh trả lời sai câu hỏi (Alias)',
    synthType: 'wrong',
    canOverlay: true,
    loop: false
  },
  {
    id: 'DauTri_10s_Timer',
    name: 'Đấu Trí - 10s Câu Thưởng',
    category: 'ĐẤU TRÍ',
    fileName: 'Acceleration/Acceleration_10s.mp3',
    description: 'Đếm giờ 10 giây cho câu hỏi thưởng',
    synthType: 'tick',
    canOverlay: true,
    loop: false
  },
  {
    id: 'DT_10s_Bonus',
    name: 'Đấu Trí - 10s Câu Thưởng (Alias)',
    category: 'ĐẤU TRÍ',
    fileName: 'Acceleration/Acceleration_10s.mp3',
    description: 'Đếm giờ 10 giây cho câu hỏi thưởng (Alias)',
    synthType: 'tick',
    canOverlay: true,
    loop: false
  },
  {
    id: 'DauTri_3Min_Warning',
    name: 'Đấu Trí - Cảnh Báo 3 Phút (Alias -> UC_Last3Minutes)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_Last3Minutes.mp3',
    description: 'Cảnh báo khi thời gian còn 3 phút',
    synthType: 'timer_start',
    canOverlay: true,
    loop: false
  },
  {
    id: 'DT_3Min_Warning',
    name: 'Đấu Trí - Cảnh Báo 3 Phút (Alias)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_Last3Minutes.mp3',
    description: 'Cảnh báo khi thời gian còn 3 phút (Alias)',
    synthType: 'timer_start',
    canOverlay: true,
    loop: false
  },
  {
    id: 'DauTri_End',
    name: 'Đấu Trí - Kết Thúc Vòng Thi (Alias -> UC_End)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_End.mp3',
    description: 'Phát khi kết thúc vòng Đấu Trí',
    synthType: 'fanfare',
    canOverlay: true,
    loop: false
  },
  {
    id: 'DT_Finish',
    name: 'Đấu Trí - Kết Thúc Vòng Thi (Alias)',
    category: 'ĐẤU TRÍ',
    fileName: 'UC/UC_End.mp3',
    description: 'Phát khi kết thúc vòng Đấu Trí (Alias)',
    synthType: 'fanfare',
    canOverlay: true,
    loop: false
  }
];

export const SOUND_PATH_PREFIX = '/sounds/';
