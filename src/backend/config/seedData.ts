import { MatchDbModel } from '../../types.js';

export const DEFAULT_MOCK_MATCH: MatchDbModel = {
  matchCode: 'OLYMPIA26',
  matchPassword: '123',
  khoi_dong: {
    cau_hoi: [
      // 1-6 (P1)
      { id: 'KD_1', noi_dung: 'Tác giả của Truyện Kiều là đại thi hào nào?', dap_an_dung: 'NGUYỄN DU', chu_thich: 'Nguyễn Du (1765 - 1820)' },
      { id: 'KD_2', noi_dung: 'Chất khí nào chiếm thể tích lớn nhất trong không khí Trái Đất?', dap_an_dung: 'NITƠ', chu_thich: 'Khí Nitơ chiếm khoảng 78%' },
      { id: 'KD_3', noi_dung: 'Hành tinh nào được gọi là hành tinh Đỏ?', dap_an_dung: 'SAO HỎA', chu_thich: 'Sao Hỏa (Mars)' },
      { id: 'KD_4', noi_dung: 'Căn bậc hai của số 144 bằng bao nhiêu?', dap_an_dung: '12', chu_thich: '12 x 12 = 144' },
      { id: 'KD_5', noi_dung: 'Kim loại duy nhất tồn tại ở thể lỏng ở nhiệt độ thường là gì?', dap_an_dung: 'THỦY NGÂN', chu_thich: 'Ký hiệu là Hg' },
      { id: 'KD_6', noi_dung: 'Tên viết tắt của Quỹ Nhi đồng Liên Hợp Quốc là gì?', dap_an_dung: 'UNICEF', chu_thich: 'United Nations Children\'s Fund' },

      // 7-12 (P2)
      { id: 'KD_7', noi_dung: 'Quốc gia nào có diện tích lớn nhất thế giới?', dap_an_dung: 'NGA', chu_thich: 'Liên bang Nga' },
      { id: 'KD_8', noi_dung: 'Ai là người lãnh đạo cuộc khởi nghĩa Lam Sơn giành độc lập chống nhà Minh?', dap_an_dung: 'LÊ LỢI', chu_thich: 'Vua Lê Thái Tổ' },
      { id: 'KD_9', noi_dung: 'Hợp chất hóa học NaCl là công thức của chất nào thường ngày?', dap_an_dung: 'MUỐI ĂN', chu_thich: 'Natri Clorua' },
      { id: 'KD_10', noi_dung: 'Sông gì lớn nhất miền Nam nước ta chảy qua Thành phố Hồ Chí Minh?', dap_an_dung: 'SÔNG SÀI GÒN', chu_thich: 'Sông Sài Gòn' },
      { id: 'KD_11', noi_dung: 'Mặt Trăng là vệ tinh tự nhiên của hành tinh nào?', dap_an_dung: 'TRÁI ĐẤT', chu_thich: 'Trái Đất' },
      { id: 'KD_12', noi_dung: 'Nữ sĩ Thơ Nôm nổi tiếng có biệt danh "Bà chúa thơ Nôm" là ai?', dap_an_dung: 'HỒ XUÂN HƯƠNG', chu_thich: 'Hồ Xuân Hương' },

      // 13-18 (P3)
      { id: 'KD_13', noi_dung: 'Cơ quan nào giữ vai trò lọc và thải chất độc chính trong hệ tuần hoàn cơ thể người?', dap_an_dung: 'GAN', chu_thich: 'Gan thực hiện hơn 500 chức năng' },
      { id: 'KD_14', noi_dung: 'Châu lục nào lạnh nhất và khô nhất trên Trái Đất?', dap_an_dung: 'NAM CỰC', chu_thich: 'Châu Nam Cực' },
      { id: 'KD_15', noi_dung: 'Số tự nhiên nhỏ nhất có hai chữ số là số mấy?', dap_an_dung: '10', chu_thich: 'Số 10' },
      { id: 'KD_16', noi_dung: 'Đỉnh núi nào cao nhất Việt Nam và toàn Đông Dương?', dap_an_dung: 'FANSIPAN', chu_thich: 'Cao 3143 mét' },
      { id: 'KD_17', noi_dung: 'Nguyên tố hóa học có ký hiệu Au là kim loại nào?', dap_an_dung: 'VÀNG', chu_thich: 'Au (Aurum)' },
      { id: 'KD_18', noi_dung: 'Chiến thắng Điện Biên Phủ "lừng lẫy năm châu" diễn ra vào năm nào?', dap_an_dung: '1954', chu_thich: 'Ngày 7/5/1954' },

      // 19-24 (P4)
      { id: 'KD_19', noi_dung: 'Thủ đô của nước Nhật Bản là thành phố nào?', dap_an_dung: 'TOKYO', chu_thich: 'Tokyo' },
      { id: 'KD_20', noi_dung: 'Bộ phim hoạt hình dài tập nào nói về một chú mèo máy thông minh đến từ tương lai?', dap_an_dung: 'DORAEMON', chu_thich: 'Nhật Bản' },
      { id: 'KD_21', noi_dung: 'Ký hiệu hóa học H2O đại diện cho hợp chất nào?', dap_an_dung: 'NƯỚC', chu_thich: 'Nước' },
      { id: 'KD_22', noi_dung: 'Tam giác có ba cạnh bằng nhau gọi là tam giác gì?', dap_an_dung: 'TAM GIÁC ĐỀU', chu_thich: 'Tam giác đều' },
      { id: 'KD_23', noi_dung: 'Ai là tác giả của tác phẩm "Tắt đèn" nổi tiếng trong văn học Việt Nam?', dap_an_dung: 'NGÔ TẤT TỐ', chu_thich: 'Ngô Tất Tố' },
      { id: 'KD_24', noi_dung: 'Đơn vị đo cường độ dòng điện trong vật lý là gì?', dap_an_dung: 'AMPE', chu_thich: 'Ký hiệu là A' },

      // 25-36 (Collective Round - Lượt chung)
      { id: 'KD_25', noi_dung: 'Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là gì?', dap_an_dung: 'HÀ NỘI', chu_thich: 'Hà Nội' },
      { id: 'KD_26', noi_dung: 'Nhà soạn nhạc thiên tài nổi tiếng thế giới bị điếc hoàn toàn là ai?', dap_an_dung: 'BEETHOVEN', chu_thich: 'Ludwig van Beethoven' },
      { id: 'KD_27', noi_dung: 'Số nguyên tố nhỏ nhất là số mấy?', dap_an_dung: '2', chu_thich: 'Số 2' },
      { id: 'KD_28', noi_dung: 'Đại dương nào có diện tích lớn nhất địa cầu?', dap_an_dung: 'THÁI BÌNH DƯƠNG', chu_thich: 'Thái Bình Dương' },
      { id: 'KD_29', noi_dung: 'Thành phố nào tại Việt Nam nổi tiếng với Festival Hoa tổ chức định kỳ?', dap_an_dung: 'ĐÀ LẠT', chu_thich: 'Đà Lạt' },
      { id: 'KD_30', noi_dung: 'Nguyên tố Cacbon có ký hiệu hóa học là chữ cái gì?', dap_an_dung: 'C', chu_thich: 'Cacbon' },
      { id: 'KD_31', noi_dung: 'Hồ nước ngọt tự nhiên lớn nhất Việt Nam nằm ở tỉnh Bắc Kạn có tên là gì?', dap_an_dung: 'HỒ BA BỂ', chu_thich: 'Hồ Ba Bể' },
      { id: 'KD_32', noi_dung: 'Hành tinh nào lớn nhất trong Hệ Mặt Trời?', dap_an_dung: 'SAO MỘC', chu_thich: 'Sao Mộc (Jupiter)' },
      { id: 'KD_33', noi_dung: 'Ai là người đầu tiên đặt chân lên Mặt Trăng?', dap_an_dung: 'NEIL ARMSTRONG', chu_thich: 'Neil Armstrong (1969)' },
      { id: 'KD_34', noi_dung: 'Tỉnh nào có diện tích lớn nhất nước Việt Nam hiện nay?', dap_an_dung: 'NGHỆ AN', chu_thich: 'Nghệ An' },
      { id: 'KD_35', noi_dung: 'Vị vua cuối cùng của triều đại nhà Nguyễn cũng như phong kiến Việt Nam là ai?', dap_an_dung: 'BẢO ĐẠI', chu_thich: 'Vua Bảo Đại' },
      { id: 'KD_36', noi_dung: 'Động vật có vú lớn nhất hành tinh là sinh vật nào?', dap_an_dung: 'CÁ VOI XANH', chu_thich: 'Cá voi xanh' }
    ]
  },
  vuot_chuong_ngai_vat: {
    tu_khoa_chinh: 'HỒ CHÍ MINH',
    anh_goc_url: 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a?w=800',
    hang_ngang: [
      { id: 1, cau_hoi: 'Thành phố lớn nhất miền Nam mang tên vị Cha già dân tộc?', dap_an: 'HỒ CHÍ MINH', so_ky_tu: 10 },
      { id: 2, cau_hoi: 'Nhà thơ tài hoa nào đã viết bài thơ vô cùng xúc động "Viếng lăng Bác"?', dap_an: 'VIỄN PHƯƠNG', so_ky_tu: 11 },
      { id: 3, cau_hoi: 'Nơi Bác Hồ ra đi tìm đường cứu nước năm 1911 tên là bến cảng gì?', dap_an: 'NHÀ RỒNG', so_ky_tu: 8 },
      { id: 4, cau_hoi: 'Dòng sông thơ mộng nào lượn quanh trung tâm thành phố Hồ Chí Minh?', dap_an: 'SÔNG SÀI GÒN', so_ky_tu: 11 },
      { id: 5, cau_hoi: 'Trong lòng nhân dân Việt Nam, Hồ Chí Minh là một vị gì vô vàn kính yêu?', dap_an: 'VỊ LÃNH TỤ', so_ky_tu: 9 }
    ]
  },
  tang_toc: {
    cau_hoi: [
      { id: 1, noi_dung: 'Ai là phi hành gia vĩ đại đầu tiên bay vào không gian vũ trụ?', dap_an_dung: 'YURI GAGARIN', thoi_gian: 20 },
      { id: 2, noi_dung: 'Kỳ quan cổ đại Kim tự tháp lớn Khufu nằm ở quốc gia nổi tiếng nào?', dap_an_dung: 'AI CẬP', thoi_gian: 20 },
      { id: 3, noi_dung: 'Đây là lá quốc kỳ thiêng liêng đại diện cho quốc gia nào?', dap_an_dung: 'VIỆT NAM', thoi_gian: 30, media: { url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', type: 'image' } },
      { id: 4, noi_dung: 'Khoa học nghiên cứu về cấu trúc xương và nội tạng con người là gì?', dap_an_dung: 'CƠ THỂ NGƯỜI', thoi_gian: 30 }
    ]
  },
  ve_dich: {
    cau_hoi: [
      { id: 'VD10_1', noi_dung: 'Số nguyên tố nhỏ nhất là số mấy?', dap_an_dung: '2', muc_diem: 10, linh_vuc: 'Toán học' },
      { id: 'VD10_2', noi_dung: 'Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là thành phố nào?', dap_an_dung: 'HÀ NỘI', muc_diem: 10, linh_vuc: 'Địa lý Việt Nam' },
      { id: 'VD10_3', noi_dung: 'Công thức hóa học của nước cất là gì?', dap_an_dung: 'H2O', muc_diem: 10, linh_vuc: 'Hóa học' },
      { id: 'VD10_4', noi_dung: 'Năm 1945, Bác Hồ đọc Tuyên ngôn Độc lập tại quảng trường nào?', dap_an_dung: 'BA ĐÌNH', muc_diem: 10, linh_vuc: 'Lịch sử Việt Nam' },
      { id: 'VD10_5', noi_dung: 'Nguyên tố hóa học có ký hiệu là Au là kim loại gì?', dap_an_dung: 'VÀNG', muc_diem: 10, linh_vuc: 'Hóa học' },
      { id: 'VD10_6', noi_dung: 'Đỉnh núi nào được mệnh danh là nóc nhà của Đông Dương?', dap_an_dung: 'FANSIPAN', chu_thich: 'Phan-xi-păng', muc_diem: 10, linh_vuc: 'Địa lý Việt Nam' },
      { id: 'VD10_7', noi_dung: 'Đơn vị đo lực trong hệ SI là gì?', dap_an_dung: 'NEWTON', chu_thich: 'Niu-tơn', muc_diem: 10, linh_vuc: 'Vật lý' },
      { id: 'VD10_8', noi_dung: 'Tác giả của tác phẩm "Truyện Kiều" là ai?', dap_an_dung: 'NGUYỄN DU', muc_diem: 10, linh_vuc: 'Văn học Việt Nam' },
      { id: 'VD10_9', noi_dung: 'Trong bảng tuần hoàn, nguyên tố có số hiệu nguyên tử bằng 1 là gì?', dap_an_dung: 'HYDRO', chu_thich: 'Hiđrô', muc_diem: 10, linh_vuc: 'Hóa học' },
      { id: 'VD10_10', noi_dung: 'Nhà thiên văn học đầu tiên phát hiện ra Trái Đất quay quanh Mặt Trời là ai?', dap_an_dung: 'COPERNICUS', chu_thich: 'Cô-péc-ních', muc_diem: 10, linh_vuc: 'Thiên văn học' },
      { id: 'VD10_11', noi_dung: 'Ngôn ngữ chính thức được sử dụng nhiều nhất tại Nam Mỹ (trừ Brazil) là gì?', dap_an_dung: 'TIẾNG TÂY BAN NHA', muc_diem: 10, linh_vuc: 'Địa lý thế giới' },
      { id: 'VD10_12', noi_dung: 'Số góc vuông trong một hình chữ nhật là bao nhiêu?', dap_an_dung: '4', muc_diem: 10, linh_vuc: 'Toán học' },

      { id: 'VD20_1', noi_dung: 'Ai là vị tổng thống đầu tiên khai sinh ra hợp chúng quốc Hoa Kỳ?', dap_an_dung: 'GEORGE WASHINGTON', muc_diem: 20, linh_vuc: 'Lịch sử thế giới' },
      { id: 'VD20_2', noi_dung: 'Phép tính đạo hàm cấp một của hàm số y = x bình phương theo biến x bằng bao nhiêu?', dap_an_dung: '2X', muc_diem: 20, linh_vuc: 'Toán học' },
      { id: 'VD20_3', noi_dung: 'Hành tinh nào trong Hệ Mặt Trời nổi tiếng với các vành đai băng đá lớn bao quanh?', dap_an_dung: 'SAO THỔ', muc_diem: 20, linh_vuc: 'Vũ trụ học' },
      { id: 'VD20_4', noi_dung: 'Chùa Một Cột, một biểu tượng văn hóa lịch sử, được xây dựng dưới triều đại nào?', dap_an_dung: 'NHÀ LÝ', muc_diem: 20, linh_vuc: 'Lịch sử Việt Nam' },
      { id: 'VD20_5', noi_dung: 'Loại hạt mang điện tích âm quay xung quanh hạt nhân nguyên tử là gì?', dap_an_dung: 'ELECTRON', muc_diem: 20, linh_vuc: 'Hóa học đại cương' },
      { id: 'VD20_6', noi_dung: 'Nhạc sĩ Cao Văn Lầu là tác giả của bản cổ nhạc bất hủ nào?', dap_an_dung: 'DẠ CỔ HOÀI LANG', muc_diem: 20, linh_vuc: 'Âm nhạc' },
      { id: 'VD20_7', noi_dung: 'Hệ thống sông nào lớn nhất miền Bắc nước ta, bồi đắp phù sa cho đồng bằng sông Hồng?', dap_an_dung: 'SÔNG HỒNG', muc_diem: 20, linh_vuc: 'Địa lý Việt Nam' },
      { id: 'VD20_8', noi_dung: 'Quốc gia láng giềng phía tây của Việt Nam có thủ đô là Viêng Chăn là nước nào?', dap_an_dung: 'LÀO', muc_diem: 20, linh_vuc: 'Địa lý khu vực' },
      { id: 'VD20_9', noi_dung: 'Trận chiến trên sông Bạch Đằng năm 938 do vị anh hùng nào lãnh đạo đánh tan quân Nam Hán?', dap_an_dung: 'NGÔ QUYỀN', muc_diem: 20, linh_vuc: 'Lịch sử Việt Nam' },
      { id: 'VD20_10', noi_dung: 'Chất sắc tố làm cho lá cây có màu xanh lục tự nhiên là chất gì?', dap_an_dung: 'DIỆP LỤC', chu_thich: 'Diệp lục tố', muc_diem: 20, linh_vuc: 'Sinh học thực vật' },
      { id: 'VD20_11', noi_dung: 'Truyện ngắn "Chữ người tử tù" là tác phẩm đặc sắc của nhà văn nào?', dap_an_dung: 'NGUYỄN TUÂN', muc_diem: 20, linh_vuc: 'Văn học Việt Nam' },
      { id: 'VD20_12', noi_dung: 'Lễ hội Đền Hùng được tổ chức hằng năm vào ngày mùng mấy tháng mấy Âm lịch?', dap_an_dung: '10 THÁNG 3', chu_thich: '10/3 âm lịch', muc_diem: 20, linh_vuc: 'Văn hóa dân gian' },

      { id: 'VD30_1', noi_dung: 'Nhà vật lý vĩ đại nào đã công bố Thuyết tương đối rộng và Thuyết tương đối hẹp?', dap_an_dung: 'ALBERT EINSTEIN', muc_diem: 30, linh_vuc: 'Vật lý hiện đại' },
      { id: 'VD30_2', noi_dung: 'Kim loại nào có nhiệt độ nóng chảy cao nhất, thường dùng làm dây tóc bóng đèn?', dap_an_dung: 'VONFRAM', muc_diem: 30, linh_vuc: 'Hóa chất đại cương' },
      { id: 'VD30_3', noi_dung: 'Châu lục nào lớn nhất thế giới cả về diện tích lẫn quy mô dân số?', dap_an_dung: 'CHÂU Á', muc_diem: 30, linh_vuc: 'Địa lý thế giới' },
      { id: 'VD30_4', noi_dung: 'Sự kiện ký Hiệp định Genève chia cắt hai miền Nam Bắc Việt Nam diễn ra vào năm nào?', dap_an_dung: '1954', muc_diem: 30, linh_vuc: 'Lịch sử cận đại' },
      { id: 'VD30_5', noi_dung: 'Bình minh mọc ở hướng nào và hoàng hôn lặn ở hướng nào?', dap_an_dung: 'ĐÔNG VÀ TÂY', chu_thich: 'Mọc Đông lặn Tây', muc_diem: 30, linh_vuc: 'Khoa học trái đất' },
      { id: 'VD30_6', noi_dung: 'Loài chim biểu tượng cho hòa bình thế giới là loài chim nào?', dap_an_dung: 'BỒ CÂU', chu_thich: 'Bồ câu trắng', muc_diem: 30, linh_vuc: 'Xã hội học' },
      { id: 'VD30_7', noi_dung: 'Hệ thống phân biệt nhóm máu phổ biến nhất ở con người gồm A, B, AB và nhóm máu nào?', dap_an_dung: 'O', chu_thich: 'Nhóm máu O', muc_diem: 30, linh_vuc: 'Y học cơ sở' },
      { id: 'VD30_8', noi_dung: 'Sân bay quốc tế lớn nhất miền Nam Việt Nam hiện tại là sân bay nào?', dap_an_dung: 'TÂN SƠN NHẤT', muc_diem: 30, linh_vuc: 'Hạ tầng giao thông' },
      { id: 'VD30_9', noi_dung: 'Đơn vị tiền tệ chính thức của khối liên minh Châu Âu là đồng tiền nào?', dap_an_dung: 'EURO', muc_diem: 30, linh_vuc: 'Kinh tế thế giới' },
      { id: 'VD30_10', noi_dung: 'Ai là tác giả của tác phẩm "Nam quốc sơn hà" được coi là bản Tuyên ngôn độc lập đầu tiên?', dap_an_dung: 'LÝ THƯỜNG KIỆT', muc_diem: 30, linh_vuc: 'Lịch sử trung đại' },
      { id: 'VD30_11', noi_dung: 'Khí gì có mùi trứng thối đặc trưng rất độc hại trong tự nhiên?', dap_an_dung: 'H2S', chu_thich: 'Hiđrô sunfua', muc_diem: 30, linh_vuc: 'Hóa học vô cơ' },
      { id: 'VD30_12', noi_dung: 'Hình tròn có bán kính r bằng 5cm thì chu vi bằng bao nhiêu cm (lấy pi xấp xỉ 3,14)?', dap_an_dung: '31.4', chu_thich: '2 x 3.14 x 5 = 31.4', muc_diem: 30, linh_vuc: 'Hình học phẳng' },

      { id: 'VD40_1', noi_dung: 'Thành tựu giải mã trình tự ADN đầu tiên của loài người thuộc về dự án quốc tế nổi tiếng nào?', dap_an_dung: 'DỰ ÁN BẢN ĐỒ GEN NGUYÊN BẢN NGƯỜI', chu_thich: 'Human Genome Project (HGP)', muc_diem: 40, linh_vuc: 'Sinh học phân tử' },
      { id: 'VD40_2', noi_dung: 'Hạt hạ nguyên tử nào truyền tương tác hấp dẫn theo lý thuyết vật lý lượng tử hiện đại?', dap_an_dung: 'GRAVITON', muc_diem: 40, linh_vuc: 'Vật lý lý thuyết' },
      { id: 'VD40_3', noi_dung: 'Triết gia vĩ đại nào của Hy Lạp cổ đại là tác giả tác phẩm "Cộng hòa" (The Republic)?', dap_an_dung: 'PLATO', chu_thich: 'Pla-tông', muc_diem: 40, linh_vuc: 'Triết học cổ đại' },
      { id: 'VD40_4', noi_dung: 'Nguyên lý bất định nổi tiếng trong cơ học lượng tử do nhà vật lý nào phát biểu năm 1927?', dap_an_dung: 'HEISENBERG', chu_thich: 'Hai-zen-béc', muc_diem: 40, linh_vuc: 'Cơ học lượng tử' },
      { id: 'VD40_5', noi_dung: 'Kinh đô đầu tiên của quốc gia Đại Cồ Việt dưới thời vua Đinh Tiên Hoàng đặt tại đâu?', dap_an_dung: 'HOA LƯ', muc_diem: 40, linh_vuc: 'Lịch sử Việt Nam' },
      { id: 'VD40_6', noi_dung: 'Hằng số Planck trong vật lý lượng tử có ký hiệu là chữ cái nào?', dap_an_dung: 'H', muc_diem: 40, linh_vuc: 'Vật lý lý thuyết' },
      { id: 'VD40_7', noi_dung: 'Chất xúc tác sinh học có bản chất là protein giúp tăng tốc độ phản ứng trong cơ thể là gì?', dap_an_dung: 'ENZYME', chu_thich: 'En-zim', muc_diem: 40, linh_vuc: 'Hóa sinh học' },
      { id: 'VD40_8', noi_dung: 'Khu vực lòng chảo sâu nhất trên Trái Đất thuộc đại dương nào?', dap_an_dung: 'THÁI BÌNH DƯƠNG', chu_thich: 'Vực Mariana', muc_diem: 40, linh_vuc: 'Địa lý đại dương' },
      { id: 'VD40_9', noi_dung: 'Tập thơ "Nhật ký trong tù" của Chủ tịch Hồ Chí Minh được sáng tác bằng chữ gì?', dap_an_dung: 'CHỮ HÁN', muc_diem: 40, linh_vuc: 'Văn học Việt Nam' },
      { id: 'VD40_10', noi_dung: 'Định lý Fermat lớn được nhà toán học Andrew Wiles chứng minh hoàn tất vào năm nào?', dap_an_dung: '1994', muc_diem: 40, linh_vuc: 'Lịch sử toán học' },
      { id: 'VD40_11', noi_dung: 'Đồng vị phóng xạ nổi tiếng được ứng dụng để xác định niên đại các cổ vật hữu cơ là gì?', dap_an_dung: 'CACBON 14', chu_thich: 'C-14', muc_diem: 40, linh_vuc: 'Hóa hạt nhân' },
      { id: 'VD40_12', noi_dung: 'Nguyên thủ quốc gia nào đã ban hành Sắc lệnh Giải phóng Nô lệ năm 1863 tại Hoa Kỳ?', dap_an_dung: 'ABRAHAM LINCOLN', muc_diem: 40, linh_vuc: 'Lịch sử thế giới' }
    ]
  },
  cau_hoi_phu: {
    cau_hoi: [
      { id: 1, noi_dung: 'Hành tinh nào nằm gần Mặt Trời nhất trong toàn bộ Hệ Mặt Trời?', dap_an_dung: 'SAO THỦY' },
      { id: 2, noi_dung: 'Tia phóng xạ nào mang điện tích dương và cấu tạo từ hạt nhân Heli?', dap_an_dung: 'TIA ALPHA' },
      { id: 3, noi_dung: 'Đại hội thể thao Đông Nam Á thường được gọi tắt bằng cụm từ tiếng Anh nào?', dap_an_dung: 'SEA GAMES' },
      { id: 4, noi_dung: 'Kim loại duy nhất ở dạng chất lỏng ở nhiệt độ phòng là gì?', dap_an_dung: 'THỦY NGÂN' },
      { id: 5, noi_dung: 'Đỉnh núi nào cao nhất Việt Nam và Đông Dương?', dap_an_dung: 'FANSIPAN' },
      { id: 6, noi_dung: 'Hợp chất hóa học nào có công thức H2O?', dap_an_dung: 'NƯỚC' },
      { id: 7, noi_dung: 'Kinh đô đầu tiên của nhà nước Văn Lang thời các Vua Hùng là vùng nào?', dap_an_dung: 'PHONG CHÂU' },
      { id: 8, noi_dung: 'Ngôn ngữ lập trình nào phổ biến bậc nhất trong phát triển ứng dụng Web?', dap_an_dung: 'JAVASCRIPT' },
      { id: 9, noi_dung: 'Đại dương nào có diện tích lớn nhất trên Trái Đất?', dap_an_dung: 'THÁI BÌNH DƯƠNG' },
      { id: 10, noi_dung: 'Văn miếu Quốc Tử Giám được thành lập dưới thời vua nào?', dap_an_dung: 'LÝ THÁNH TÔNG' },
      { id: 11, noi_dung: 'Hạt nhân nguyên tử được cấu tạo bởi hai loại hạt nào?', dap_an_dung: 'PROTON VÀ NEUTRON' },
      { id: 12, noi_dung: 'Thành phố nào là thủ đô của Nhật Bản?', dap_an_dung: 'TOKYO' },
      { id: 13, noi_dung: 'Ai là tác giả của tác phẩm "Truyện Kiều"?', dap_an_dung: 'NGUYỄN DU' },
      { id: 14, noi_dung: 'Vitamin nào có nhiều trong cam, chanh giúp tăng sức đề kháng?', dap_an_dung: 'VITAMIN C' },
      { id: 15, noi_dung: 'Phim hoạt hình đầu tiên đoạt giải Oscar do hãng sản xuất phim nào phát hành?', dap_an_dung: 'DISNEY' },
      { id: 16, noi_dung: 'Hệ đơn vị quốc tế SI đo cường độ dòng điện bằng đơn vị gì?', dap_an_dung: 'AMPE' },
      { id: 17, noi_dung: 'Tỉnh nào có diện tích lớn nhất Việt Nam?', dap_an_dung: 'NGHỆ AN' },
      { id: 18, noi_dung: 'Quang hợp ở cây xanh thải ra khí nào duy trì sự sống?', dap_an_dung: 'OXY' },
      { id: 19, noi_dung: 'Sông Ngân Hà trong vũ trụ thuộc thiên hà nào?', dap_an_dung: 'MILKY WAY' },
      { id: 20, noi_dung: 'Nhạc sĩ nào sáng tác ca khúc "Tiến quân ca"?', dap_an_dung: 'VĂN CAO' },
      { id: 21, noi_dung: 'Lực nào giữ Trái Đất quay xung quanh Mặt Trời?', dap_an_dung: 'LỰC HẤP DẪN' },
      { id: 22, noi_dung: 'Đại chiến thế giới thứ hai kết thúc vào năm nào?', dap_an_dung: '1945' },
      { id: 23, noi_dung: 'Đảo nào lớn nhất Việt Nam?', dap_an_dung: 'PHÚ QUỐC' },
      { id: 24, noi_dung: 'Số đo góc vuông trong hệ độ là bao nhiêu độ?', dap_an_dung: '90 ĐỘ' },
      { id: 25, noi_dung: 'Động vật nào lớn nhất còn sống trên Trái Đất hiện nay?', dap_an_dung: 'CÁ VOI XANH' }
    ]
  },
  chinh_phuc: {
    de_cau_hoi: {
      de: [
        { id: 'CP_DE_1', noi_dung: 'Tác giả Truyện Kiều là đại thi hào nào?', dap_an_dung: 'NGUYỄN DU', muc_diem: 10 },
        { id: 'CP_DE_2', noi_dung: 'Số nguyên tố chẵn duy nhất là số mấy?', dap_an_dung: '2', muc_diem: 10 },
        { id: 'CP_DE_3', noi_dung: 'Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là gì?', dap_an_dung: 'HÀ NỘI', muc_diem: 10 },
        { id: 'CP_DE_4', noi_dung: 'Chất khí nào chiếm thể tích lớn nhất trong không khí quyển?', dap_an_dung: 'NITƠ', muc_diem: 10 },
        { id: 'CP_DE_5', noi_dung: 'Đỉnh núi cao nhất Việt Nam là đỉnh núi nào?', dap_an_dung: 'FANSIPAN', muc_diem: 10 },
        { id: 'CP_DE_6', noi_dung: 'Nguyên tố hóa học có ký hiệu H2O là chất gì?', dap_an_dung: 'NƯỚC', muc_diem: 10 }
      ],
      trung_binh: [
        { id: 'CP_TB_1', noi_dung: 'Vị tướng đã chỉ huy Trận Bạch Đằng năm 938 đánh tan quân Nam Hán?', dap_an_dung: 'NGÔ QUYỀN', muc_diem: 20 },
        { id: 'CP_TB_2', noi_dung: 'Nhạc sĩ sáng tác ca khúc Tiến Quân Ca - Quốc ca Việt Nam là ai?', dap_an_dung: 'VĂN CAO', muc_diem: 20 },
        { id: 'CP_TB_3', noi_dung: 'Tỉnh thành nào có diện tích tự nhiên lớn nhất Việt Nam?', dap_an_dung: 'NGHỆ AN', muc_diem: 20 },
        { id: 'CP_TB_4', noi_dung: 'Khí gì có mùi trứng thối đặc trưng rất độc hại?', dap_an_dung: 'H2S', muc_diem: 20 },
        { id: 'CP_TB_5', noi_dung: 'Sông gì chảy hoàn toàn trên lãnh thổ Việt Nam dài nhất?', dap_an_dung: 'SÔNG ĐỒNG NAI', muc_diem: 20 },
        { id: 'CP_TB_6', noi_dung: 'Nhà văn là tác giả của tác phẩm thiếu nhi Dế Mèn Phiêu Lưu Ký?', dap_an_dung: 'TÔ HOÀI', muc_diem: 20 }
      ],
      kho: [
        { id: 'CP_KHO_1', noi_dung: 'Triết gia Hy Lạp cổ đại là tác giả tác phẩm Cộng hòa (The Republic)?', dap_an_dung: 'PLATO', muc_diem: 30 },
        { id: 'CP_KHO_2', noi_dung: 'Bào quan nào trong tế bào nhân thực được gọi là nhà máy năng lượng?', dap_an_dung: 'TY THỂ', muc_diem: 30 },
        { id: 'CP_KHO_3', noi_dung: 'Nguyên lý bất định trong cơ học lượng tử do nhà vật lý nào phát biểu?', dap_an_dung: 'HEISENBERG', muc_diem: 30 },
        { id: 'CP_KHO_4', noi_dung: 'Quốc gia nào có diện tích bờ biển dài nhất thế giới?', dap_an_dung: 'CANADA', muc_diem: 30 },
        { id: 'CP_KHO_5', noi_dung: 'Tên vị vua khai sáng nhà Lý dời đô về Thăng Long năm 1010?', dap_an_dung: 'LÝ THÁI TỔ', muc_diem: 30 },
        { id: 'CP_KHO_6', noi_dung: 'Hằng số Planck trong vật lý lượng tử có ký hiệu là chữ cái nào?', dap_an_dung: 'H', muc_diem: 30 }
      ]
    },
    gmdt: [
      { mat_ma: '8327515', goi_y: 'Tên viết tắt đất nước chúng ta', dap_an_dung: 'VIETNAM' },
      { mat_ma: '6592222', goi_y: 'Sân chơi trí tuệ học đường cấp Quốc gia', dap_an_dung: 'OLYMPIA' }
    ]
  },
  dau_tri: {
    cau_hoi: [
      {
        id: 1,
        noi_dung: 'Nguyên tố hóa học nào có ký hiệu Au trong bảng tuần hoàn Mendeleev?',
        dap_an_dung: 'VÀNG',
        chu_thich: 'Ký hiệu từ tiếng Latin Aurum',
        goi_thuong: {
          chu_de: 'Kim loại quý và ứng dụng',
          cau_hoi: [
            { id: '1_1', noi_dung: 'Kim loại nào dẫn điện tốt nhất ở điều kiện tiêu chuẩn?', dap_an_dung: 'BẠC' },
            { id: '1_2', noi_dung: 'Bạch kim là tên gọi thông thường của nguyên tố kim loại nào?', dap_an_dung: 'PLATIN' },
            { id: '1_3', noi_dung: 'Hỗn hợp axit nào có thể hòa tan được vàng?', dap_an_dung: 'NƯỚC CƯỜNG TOAN' }
          ]
        }
      },
      {
        id: 2,
        noi_dung: 'Ai là vị vua sáng lập triều đại nhà Lý và dời đô về Thăng Long năm 1010?',
        dap_an_dung: 'LÝ THÁI TỔ',
        chu_thich: 'Lý Công Uẩn (974 - 1028)',
        goi_thuong: {
          chu_de: 'Kinh đô Thăng Long - Hà Nội',
          cau_hoi: [
            { id: '2_1', noi_dung: 'Tên gọi Hà Nội được vua Minh Mạng đặt ra vào năm nào?', dap_an_dung: '1831' },
            { id: '2_2', noi_dung: 'Hồ nước ngọt tự nhiên lớn nhất nội thành Hà Nội là hồ nào?', dap_an_dung: 'HỒ TÂY' },
            { id: '2_3', noi_dung: 'Cầu thép đầu tiên bắc qua sông Hồng tại Hà Nội tên là gì?', dap_an_dung: 'CẦU LONG BIÊN' }
          ]
        }
      },
      {
        id: 3,
        noi_dung: 'Đơn vị đo lực trong hệ đo lường quốc tế SI mang tên nhà vật lý nào?',
        dap_an_dung: 'NEWTON',
        chu_thich: 'Ký hiệu là N (Isaac Newton)',
        goi_thuong: {
          chu_de: 'Đơn vị đo lường Vật lý SI',
          cau_hoi: [
            { id: '3_1', noi_dung: 'Đơn vị đo công và năng lượng trong hệ SI là gì?', dap_an_dung: 'JOULE' },
            { id: '3_2', noi_dung: 'Đơn vị đo tần số trong hệ SI mang tên nhà vật lý nào?', dap_an_dung: 'HERTZ' },
            { id: '3_3', noi_dung: 'Đơn vị đo điện dung tụ điện là gì?', dap_an_dung: 'FARAD' }
          ]
        }
      },
      {
        id: 4,
        noi_dung: 'Tác phẩm văn học "Truyện Kiều" của đại thi hào Nguyễn Du gồm bao nhiêu câu lục bát?',
        dap_an_dung: '3254',
        chu_thich: 'Gồm đúng 3.254 câu thơ lục bát',
        goi_thuong: {
          chu_de: 'Văn học cổ điển Việt Nam',
          cau_hoi: [
            { id: '4_1', noi_dung: 'Ai là tác giả của tác phẩm "Truyền kỳ mạn lục"?', dap_an_dung: 'NGUYỄN DỮ' },
            { id: '4_2', noi_dung: 'Nữ sĩ nào được mệnh danh là "Bà chúa thơ Nôm"?', dap_an_dung: 'HỒ XUÂN HƯƠNG' },
            { id: '4_3', noi_dung: 'Tác phẩm "Chinh phụ ngâm khúc" nguyên tác chữ Hán của ai?', dap_an_dung: 'ĐẶNG TRẦN CÔN' }
          ]
        }
      },
      {
        id: 5,
        noi_dung: 'Đại dương nào có diện tích và độ sâu trung bình lớn nhất Trái Đất?',
        dap_an_dung: 'THÁI BÌNH DƯƠNG',
        chu_thich: 'Rộng hơn 165 triệu km²',
        goi_thuong: {
          chu_de: 'Địa lý đại dương thế giới',
          cau_hoi: [
            { id: '5_1', noi_dung: 'Vực biển sâu nhất thế giới mang tên rãnh vực nào?', dap_an_dung: 'MARIANA' },
            { id: '5_2', noi_dung: 'Đại dương nào nhỏ nhất và nông nhất trong 5 đại dương?', dap_an_dung: 'BẮC BĂNG DƯƠNG' },
            { id: '5_3', noi_dung: 'Dòng hải lưu nóng chảy qua Đại Tây Dương tên là gì?', dap_an_dung: 'GULF STREAM' }
          ]
        }
      },
      {
        id: 6,
        noi_dung: 'Bào quan nào được ví như "nhà máy năng lượng" của tế bào nhân thực?',
        dap_an_dung: 'TY THỂ',
        chu_thich: 'Mitochondria - Nơi tổng hợp ATP',
        goi_thuong: {
          chu_de: 'Sinh học tế bào',
          cau_hoi: [
            { id: '6_1', noi_dung: 'Bào quan nào chịu trách nhiệm tổng hợp protein trong tế bào?', dap_an_dung: 'RIBOSOME' },
            { id: '6_2', noi_dung: 'Bào quan chứa sắc tố diệp lục ở tế bào thực vật là gì?', dap_an_dung: 'LỤC LẠP' },
            { id: '6_3', noi_dung: 'Phân tử mang thông tin di truyền chính của hầu hết sinh vật là gì?', dap_an_dung: 'DNA' }
          ]
        }
      },
      {
        id: 7,
        noi_dung: 'Họa sĩ nào là tác giả của bức tranh nàng Mona Lisa nổi tiếng thế giới?',
        dap_an_dung: 'LEONARDO DA VINCI',
        chu_thich: 'Trưng bày tại bảo tàng Louvre, Paris',
        goi_thuong: {
          chu_de: 'Nghệ thuật Phục hưng châu Âu',
          cau_hoi: [
            { id: '7_1', noi_dung: 'Họa sĩ điêu khắc tác phẩm tượng David bằng cẩm thạch là ai?', dap_an_dung: 'MICHELANGELO' },
            { id: '7_2', noi_dung: 'Bức tranh "Trường học Athens" do danh họa nào sáng tác?', dap_an_dung: 'RAPHAEL' },
            { id: '7_3', noi_dung: 'Bức tranh "Bữa ăn tối cuối cùng" vẽ trên tường tu viện nào ở Milan?', dap_an_dung: 'SANTA MARIA DELLE GRAZIE' }
          ]
        }
      },
      {
        id: 8,
        noi_dung: 'Chiến dịch quân sự nào đã kết thúc thắng lợi cuộc kháng chiến chống Mỹ cứu nước năm 1975?',
        dap_an_dung: 'CHIẾN DỊCH HỒ CHÍ MINH',
        chu_thich: '26/4/1975 - 30/4/1975',
        goi_thuong: {
          chu_de: 'Những chiến dịch quân sự lịch sử Việt Nam',
          cau_hoi: [
            { id: '8_1', noi_dung: 'Chiến dịch giải phóng Tây Nguyên mở màn bằng trận đánh ở thị xã nào?', dap_an_dung: 'BUÔN MA THUỘT' },
            { id: '8_2', noi_dung: 'Trận Điện Biên Phủ trên không diễn ra vào tháng 12 năm nào?', dap_an_dung: '1972' },
            { id: '8_3', noi_dung: 'Tướng giặc nào nhảy cầu tự tử sau thất bại ở trận Chi Lăng - Xương Giang?', dap_an_dung: 'LIỄU THĂNG' }
          ]
        }
      },
      {
        id: 9,
        noi_dung: 'Chất khí nào chiếm khoảng 78% thể tích khí quyển Trái Đất?',
        dap_an_dung: 'NITƠ',
        chu_thich: 'Khí Nitơ (N2)',
        goi_thuong: {
          chu_de: 'Khí quyển và hóa học các chất khí',
          cau_hoi: [
            { id: '9_1', noi_dung: 'Tầng khí quyển nào chứa tầng ozone hấp thụ tia cực tím?', dap_an_dung: 'TẦNG BÌNH LƯU' },
            { id: '9_2', noi_dung: 'Khí nào là nguyên nhân chính gây hiệu ứng nhà kính hiện nay?', dap_an_dung: 'CO2' },
            { id: '9_3', noi_dung: 'Khí hiếm nào nhẹ thứ hai sau Hydro và được bơm vào khinh khí cầu an toàn?', dap_an_dung: 'HELI' }
          ]
        }
      },
      {
        id: 10,
        noi_dung: 'Quốc gia nào có diện tích lãnh thổ tự nhiên lớn nhất thế giới hiện nay?',
        dap_an_dung: 'NGA',
        chu_thich: 'Hơn 17.1 triệu km²',
        goi_thuong: {
          chu_de: 'Địa lý các quốc gia thế giới',
          cau_hoi: [
            { id: '10_1', noi_dung: 'Quốc gia nào có đường bờ biển dài nhất thế giới?', dap_an_dung: 'CANADA' },
            { id: '10_2', noi_dung: 'Thành bang/quốc gia nào có diện tích nhỏ nhất thế giới?', dap_an_dung: 'VATICAN' },
            { id: '10_3', noi_dung: 'Hồ nước ngọt sâu nhất thế giới nằm ở nước Nga tên là gì?', dap_an_dung: 'BAIKAL' }
          ]
        }
      },
      {
        id: 11,
        noi_dung: 'Nhà soạn nhạc người Đức nào đã sáng tác bản Giao hưởng số 9 "Khúc hoan ca" khi bị điếc?',
        dap_an_dung: 'BEETHOVEN',
        chu_thich: 'Ludwig van Beethoven (1770 - 1827)',
        goi_thuong: {
          chu_de: 'Âm nhạc cổ điển thế giới',
          cau_hoi: [
            { id: '11_1', noi_dung: 'Thần đồng âm nhạc người Áo là tác giả vở opera "Cây sáo thần"?', dap_an_dung: 'MOZART' },
            { id: '11_2', noi_dung: 'Tác giả tổ khúc 4 bản concerto "Bốn mùa" (The Four Seasons) là ai?', dap_an_dung: 'VIVALDI' },
            { id: '11_3', noi_dung: 'Nhạc sĩ Ba Lan được mệnh danh là "Nhà thơ của cây đàn piano"?', dap_an_dung: 'CHOPIN' }
          ]
        }
      },
      {
        id: 12,
        noi_dung: 'Số nguyên tố chẵn duy nhất trong tập hợp các số tự nhiên là số mấy?',
        dap_an_dung: '2',
        chu_thich: 'Số nguyên tố nhỏ nhất và chẵn duy nhất',
        goi_thuong: {
          chu_de: 'Lý thuyết số và Toán học',
          cau_hoi: [
            { id: '12_1', noi_dung: 'Số tự nhiên nguyên tố đầu tiên có hai chữ số là số mấy?', dap_an_dung: '11' },
            { id: '12_2', noi_dung: 'Định lý Fermat cuối cùng do nhà toán học nào chứng minh hoàn tất năm 1994?', dap_an_dung: 'ANDREW WILES' },
            { id: '12_3', noi_dung: 'Tỉ số giữa chu vi hình tròn và đường kính của nó là hằng số gì?', dap_an_dung: 'PI' }
          ]
        }
      },
      {
        id: 13,
        noi_dung: 'Hành tinh nào trong Hệ Mặt Trời có đường kính và khối lượng lớn nhất?',
        dap_an_dung: 'SAO MỘC',
        chu_thich: 'Jupiter',
        goi_thuong: {
          chu_de: 'Thiên văn học và Vũ trụ',
          cau_hoi: [
            { id: '13_1', noi_dung: 'Hành tinh nào có hệ thống vành đai ngoạn mục và rõ nét nhất?', dap_an_dung: 'SAO THỔ' },
            { id: '13_2', noi_dung: 'Hành tinh nào nóng nhất trong Hệ Mặt Trời do hiệu ứng nhà kính dày đặc?', dap_an_dung: 'SAO KIM' },
            { id: '13_3', noi_dung: 'Thiên hà xoắn ốc chứa Hệ Mặt Trời của chúng ta tên là gì?', dap_an_dung: 'NGÂN HÀ' }
          ]
        }
      },
      {
        id: 14,
        noi_dung: 'Nhà bác học nào đã tìm ra định luật Vạn vật hấp dẫn và 3 định luật chuyển động cơ bản?',
        dap_an_dung: 'ISAAC NEWTON',
        chu_thich: 'Công bố trong tác phẩm Principia Mathematica năm 1687',
        goi_thuong: {
          chu_de: 'Lịch sử Khoa học thế giới',
          cau_hoi: [
            { id: '14_1', noi_dung: 'Nhà khoa học nào phát biểu Thuyết Tương đối hẹp và Thuyết Tương đối rộng?', dap_an_dung: 'ALBERT EINSTEIN' },
            { id: '14_2', noi_dung: 'Nhà nữ bác học đầu tiên đạt hai giải Nobel ở hai lĩnh vực khác nhau?', dap_an_dung: 'MARIE CURIE' },
            { id: '14_3', noi_dung: 'Nhà bác học Hy Lạp cổ đại thốt lên "Eureka" khi tìm ra định luật lực đẩy?', dap_an_dung: 'ARCHIMEDES' }
          ]
        }
      },
      {
        id: 15,
        noi_dung: 'Thành phố nào là trung tâm kinh tế và đầu tàu tài chính lớn nhất phía Nam Việt Nam?',
        dap_an_dung: 'THÀNH PHỐ HỒ CHÍ MINH',
        chu_thich: 'Tên gọi Sài Gòn - Gia Định trước năm 1976',
        goi_thuong: {
          chu_de: 'Kinh tế & Đô thị Việt Nam',
          cau_hoi: [
            { id: '15_1', noi_dung: 'Tòa nhà cao nhất Việt Nam hiện nay tọa lạc tại TP.HCM có tên là gì?', dap_an_dung: 'LANDMARK 81' },
            { id: '15_2', noi_dung: 'Cảng biển nước sâu lớn nhất Việt Nam tại Bà Rịa - Vũng Tàu tên là gì?', dap_an_dung: 'CÁI MÉP - THỊ VẢI' },
            { id: '15_3', noi_dung: 'Thành phố trực thuộc Trung ương duy nhất ở vùng Đồng bằng sông Cửu Long?', dap_an_dung: 'CẦN THƠ' }
          ]
        }
      },
      {
        id: 16,
        noi_dung: 'Tác giả của bài Tiến Quân Ca - Quốc ca chính thức của nước CHXHCN Việt Nam là ai?',
        dap_an_dung: 'VĂN CAO',
        chu_thich: 'Nhạc sĩ Văn Cao sáng tác năm 1944',
        goi_thuong: {
          chu_de: 'Âm nhạc Cách mạng Việt Nam',
          cau_hoi: [
            { id: '16_1', noi_dung: 'Nhạc sĩ nào sáng tác ca khúc "Giải phóng Điện Biên"?', dap_an_dung: 'ĐỖ NHUẬN' },
            { id: '16_2', noi_dung: 'Ai là tác giả của ca khúc thiếu nhi bất hủ "Ai yêu Bác Hồ Chí Minh hơn thiếu niên nhi đồng"?', dap_an_dung: 'PHONG NHÃ' },
            { id: '16_3', noi_dung: 'Nhạc sĩ tài hoa là tác giả bài hát "Như có Bác trong ngày đại thắng"?', dap_an_dung: 'PHẠM TUYÊN' }
          ]
        }
      },
      {
        id: 17,
        noi_dung: 'Cơ quan nào trong cơ thể người có chức năng lọc máu tạo ra nước tiểu?',
        dap_an_dung: 'THẬN',
        chu_thich: 'Mỗi quả thận chứa khoảng 1 triệu nephron',
        goi_thuong: {
          chu_de: 'Giải phẫu và Sinh lý người',
          cau_hoi: [
            { id: '17_1', noi_dung: 'Cơ quan nội tạng có khối lượng lớn nhất trong cơ thể người là gì?', dap_an_dung: 'GAN' },
            { id: '17_2', noi_dung: 'Loại tế bào máu nào chịu trách nhiệm vận chuyển oxy đi khắp cơ thể?', dap_an_dung: 'HỒNG CẦU' },
            { id: '17_3', noi_dung: 'Van tim ngăn cách giữa tâm nhĩ trái và tâm thất trái là van mấy lá?', dap_an_dung: 'HAI LÁ' }
          ]
        }
      },
      {
        id: 18,
        noi_dung: 'Kênh đào nhân tạo nào nối liền Địa Trung Hải với Biển Đỏ, khánh thành năm 1869?',
        dap_an_dung: 'KÊNH ĐÀO SUEZ',
        chu_thich: 'Nằm trên lãnh thổ Ai Cập',
        goi_thuong: {
          chu_de: 'Kênh đào và Công trình thủy văn',
          cau_hoi: [
            { id: '18_1', noi_dung: 'Kênh đào nào nối liền Thái Bình Dương và Đại Tây Dương qua Trung Mỹ?', dap_an_dung: 'KÊNH ĐÀO PANAMA' },
            { id: '18_2', noi_dung: 'Kênh đào nhân tạo dài nhất và lâu đời nhất thế giới nằm ở quốc gia nào?', dap_an_dung: 'TRUNG QUỐC' },
            { id: '18_3', noi_dung: 'Kênh đào Suez được thiết kế bởi kỹ sư người nước nào?', dap_an_dung: 'PHÁP' }
          ]
        }
      },
      {
        id: 19,
        noi_dung: 'Vận tốc ánh sáng truyền trong môi trường chân không xấp xỉ bằng bao nhiêu km/s?',
        dap_an_dung: '300000',
        chu_thich: 'Chính xác là 299.792.458 m/s',
        goi_thuong: {
          chu_de: 'Quang học và Sóng điện từ',
          cau_hoi: [
            { id: '19_1', noi_dung: 'Hiện tượng ánh sáng bị gãy khúc khi truyền qua mặt phân cách hai môi trường gọi là gì?', dap_an_dung: 'KHÚC XẠ ÁNH SÁNG' },
            { id: '19_2', noi_dung: 'Bức xạ điện từ có bước sóng ngắn hơn ánh sáng khả kiến tím là tia gì?', dap_an_dung: 'TIA TỬ NGOẠI' },
            { id: '19_3', noi_dung: 'Hiện tượng chùm ánh sáng trắng bị tách thành dải màu gọi là hiện tượng gì?', dap_an_dung: 'TÁN SẮC ÁNH SÁNG' }
          ]
        }
      },
      {
        id: 20,
        noi_dung: 'Vị vua nào của triều đại nhà Trần đã lãnh đạo nhân dân đánh thắng quân Nguyên Mông hai lần (1285 và 1288)?',
        dap_an_dung: 'TRẦN NHÂN TÔNG',
        chu_thich: 'Vua Trần Nhân Tông (Trần Khâm) và Trần Thánh Tông',
        goi_thuong: {
          chu_de: 'Triều đại nhà Trần',
          cau_hoi: [
            { id: '20_1', noi_dung: 'Hội nghị quân sự họp các bô lão bàn kế sách đánh giặc năm 1284 tên là gì?', dap_an_dung: 'HỘI NGHỊ DIÊN HỒNG' },
            { id: '20_2', noi_dung: 'Vị tướng soái giữ chức Quốc công Tiết chế triều Trần là ai?', dap_an_dung: 'TRẦN HƯNG ĐẠO' },
            { id: '20_3', noi_dung: 'Thiền phái Phật giáo do vua Trần Nhân Tông sáng lập tại núi Yên Tử tên là gì?', dap_an_dung: 'TRÚC LÂM YÊN TỬ' }
          ]
        }
      },
      {
        id: 21,
        noi_dung: 'Đơn vị tiền tệ chung của hầu hết các quốc gia thành viên Liên minh châu Âu (EU) là gì?',
        dap_an_dung: 'EURO',
        chu_thich: 'Ký hiệu là €',
        goi_thuong: {
          chu_de: 'Tiền tệ và Kinh tế Quốc tế',
          cau_hoi: [
            { id: '21_1', noi_dung: 'Đồng tiền chính thức của Vương quốc Anh là đồng tiền nào?', dap_an_dung: 'BẢNG ANH' },
            { id: '21_2', noi_dung: 'Trụ sở Ngân hàng Trung ương châu Âu (ECB) đặt tại thành phố nào của Đức?', dap_an_dung: 'FRANKFURT' },
            { id: '21_3', noi_dung: 'Đồng tiền pháp định của Nhật Bản có tên là gì?', dap_an_dung: 'YÊN' }
          ]
        }
      },
      {
        id: 22,
        noi_dung: 'Quá trình thực vật sử dụng năng lượng ánh sáng mặt trời để tổng hợp chất hữu cơ gọi là gì?',
        dap_an_dung: 'QUANG HỢP',
        chu_thich: 'Photosynthesis',
        goi_thuong: {
          chu_de: 'Sinh thái học và Thực vật',
          cau_hoi: [
            { id: '22_1', noi_dung: 'Khí nào được hấp thụ trong quá trình quang hợp của cây xanh?', dap_an_dung: 'CO2' },
            { id: '22_2', noi_dung: 'Khí nào được giải phóng ra môi trường trong quá trình quang hợp?', dap_an_dung: 'OXY' },
            { id: '22_3', noi_dung: 'Cây xương rồng quang hợp chủ yếu qua bộ phận nào của cây?', dap_an_dung: 'THÂN CÂY' }
          ]
        }
      },
      {
        id: 23,
        noi_dung: 'Ai là tác giả của tiểu thuyết "Những người khốn khổ" (Les Misérables) nổi tiếng?',
        dap_an_dung: 'VICTOR HUGO',
        chu_thich: 'Đại văn hào người Pháp (1802 - 1885)',
        goi_thuong: {
          chu_de: 'Văn học Pháp và Thế giới',
          cau_hoi: [
            { id: '23_1', noi_dung: 'Nhân vật chính diện trung tâm trong tác phẩm "Những người khốn khổ" tên là gì?', dap_an_dung: 'JEAN VALJEAN' },
            { id: '23_2', noi_dung: 'Tiểu thuyết về chàng gù Quasimodo của Victor Hugo lấy bối cảnh nhà thờ nào?', dap_an_dung: 'NHÀ THỜ ĐỨC BÀ PARIS' },
            { id: '23_3', noi_dung: 'Tác giả của cuốn truyện phiêu lưu thiếu nhi "Hoàng tử bé" là ai?', dap_an_dung: 'SAINT-EXUPÉRY' }
          ]
        }
      },
      {
        id: 24,
        noi_dung: 'Tam giác vuông có độ dài hai cạnh góc vuông lần lượt là 3cm và 4cm thì cạnh huyền bằng bao nhiêu cm?',
        dap_an_dung: '5',
        chu_thich: 'Theo định lý Pythagore: 3² + 4² = 5²',
        goi_thuong: {
          chu_de: 'Hình học phẳng',
          cau_hoi: [
            { id: '24_1', noi_dung: 'Tổng số đo 3 góc trong một tam giác phẳng bằng bao nhiêu độ?', dap_an_dung: '180 ĐỘ' },
            { id: '24_2', noi_dung: 'Giao điểm của 3 đường cao trong một tam giác gọi là gì?', dap_an_dung: 'TRỰC TÂM' },
            { id: '24_3', noi_dung: 'Tứ giác có 4 cạnh bằng nhau và 4 góc vuông gọi là hình gì?', dap_an_dung: 'HÌNH VUÔNG' }
          ]
        }
      },
      {
        id: 25,
        noi_dung: 'Sân vận động nào lớn nhất nước Anh và là nơi diễn ra các trận chung kết Cúp FA?',
        dap_an_dung: 'WEMBLEY',
        chu_thich: 'Sức chứa 90.000 chỗ ngồi tại London',
        goi_thuong: {
          chu_de: 'Thể thao và Thế vận hội',
          cau_hoi: [
            { id: '25_1', noi_dung: 'Quốc gia nào là quê hương khởi nguồn của Thế vận hội Olympic thời cổ đại?', dap_an_dung: 'HY LẠP' },
            { id: '25_2', noi_dung: 'Thành phố nào đăng cai Thế vận hội Mùa hè Olympic năm 2024?', dap_an_dung: 'PARIS' },
            { id: '25_3', noi_dung: 'Kình ngư người Mỹ giành kỷ lục 23 huy chương vàng Olympic môn bơi lội là ai?', dap_an_dung: 'MICHAEL PHELPS' }
          ]
        }
      }
    ]
  },
  media_ngoai: [
    { id: 'EM_1', name: 'Nhạc Hiệu Intro Olympia', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', type: 'audio' },
    { id: 'EM_2', name: 'Video Giới Thiệu Trận Đấu', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', type: 'video' },
    { id: 'EM_3', name: 'Poster Vòng Chung Kết', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200', type: 'image' }
  ]
};
