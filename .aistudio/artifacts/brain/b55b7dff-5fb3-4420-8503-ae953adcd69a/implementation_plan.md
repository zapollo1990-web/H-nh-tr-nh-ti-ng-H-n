# Kế Hoạch Triển Khai: Ngân Hàng Đề Thi TOPIK Các Năm (2014 Đến Nay)

Tài liệu này vạch ra kế hoạch phát triển và bổ sung kho dữ liệu đề thi TOPIK chính thức từ năm 2014 đến nay, tổ chức khoa học theo từng năm và kỳ thi thực tế, đồng thời nâng cấp giao diện phòng thi thử với đồng hồ đếm ngược, bảng điều hướng câu hỏi, chấm điểm tự động và giải thích đáp án chi tiết.

---

## 1. Tổng Quan & Mục Tiêu

### A. Bối cảnh
Người học tiếng Hàn cần rèn luyện với các đề thi thật qua các năm để làm quen với cấu trúc đề thi chính thức của Viện Giáo dục Quốc tế Quốc gia Hàn Quốc (NIIED) từ khi chuyển đổi sang định dạng đề mới (từ Kỳ 35 năm 2014) đến các kỳ thi chuẩn hóa gần đây (2024 - 2026).

### B. Kết quả mong đợi
- **Kho đề thi mở rộng phong phú**: Bổ sung bộ đề các năm: 2014 (Kỳ 35), 2015 (Kỳ 41), 2016 - 2017 (Kỳ 47, Kỳ 52), 2018 - 2019 (Kỳ 60, Kỳ 64), 2022 (Kỳ 83), 2023 - 2024 (Kỳ 91, Kỳ 94), và 2025 - 2026 (Kỳ thi chuẩn hóa mới).
- **Phân loại 2 chiều tiện ích**:
  1. *Theo Cấp độ*: TOPIK I (Cấp 1 & 2) và TOPIK II (Cấp 3, 4, 5, 6).
  2. *Theo Năm thi / Kỳ thi thực tế*: 2014, 2015, 2016 - 2018, 2019 - 2022, 2023 - 2026.
- **Trải nghiệm phòng thi thực tế**:
  - Đồng hồ đếm ngược thời gian thực (15 - 35 phút tùy cấp độ).
  - Bảng điều hướng câu hỏi nhanh (Question Grid Navigator) giúp thí sinh dễ dàng kiểm tra câu đã làm / chưa làm.
  - Chấm điểm tự động tức thì, phân tích tỉ lệ câu đúng/sai, kèm giải thích ngữ pháp và từ vựng chi tiết bằng tiếng Việt.
  - Tích hợp phát âm giọng đọc tiếng Hàn cho từng câu hỏi và pháo hoa chúc mừng khi đạt điểm mục tiêu.

---

## 2. Kiến Trúc Dữ Liệu & Danh Mục Đề Thi Qua Các Năm

### A. Mở rộng Type Definition (`src/types.ts`)
Bổ sung các trường siêu dữ liệu vào `TopikTest` và `TopikQuestion`:
- `year`: Năm tổ chức thi (ví dụ: `2014`, `2015`, `2018`, `2019`, `2022`, `2023`, `2024`, `2026`).
- `examRound`: Số hiệu kỳ thi chính thức (ví dụ: `35`, `41`, `47`, `52`, `60`, `64`, `83`, `91`, `94`).
- `examSession`: Nhãn hiển thị kỳ thi (ví dụ: `"Kỳ thi thứ 35 (Năm 2014)"`, `"Kỳ thi thứ 64 (Năm 2019)"`).
- `sectionType`: Phân nhóm kỹ năng (`'reading'` - Đọc hiểu, `'grammar_vocab'` - Từ vựng & Ngữ pháp).

### B. Danh Mục Các Bộ Đề Thi Bổ Sung (`src/data/topikPastExamsData.ts`)
1. **Kỳ 35 (Năm 2014 - Kỳ thi bản lề đổi mới TOPIK)**:
   - *TOPIK I (Kỳ 35 - 2014)*: Các câu hỏi căn bản về biển báo sinh hoạt, chọn chủ đề bài đọc, từ nối và tiểu từ.
   - *TOPIK II (Kỳ 35 - 2014)*: Đọc hiểu văn bản xã hội ngắn, điền trợ từ liên kết câu, trật tự câu văn.
2. **Kỳ 41 & Kỳ 47 (Năm 2015 - 2016)**:
   - *TOPIK I (Kỳ 41 - 2015)*: Đoạn văn quảng cáo, tin nhắn điện thoại, tìm thông tin giống bài đọc.
   - *TOPIK II (Kỳ 47 - 2016)*: Điền cụm từ vào chỗ trống, sắp xếp đoạn văn logic `[가-나-다-라]`, thành ngữ thông dụng.
3. **Kỳ 52 & Kỳ 60 (Năm 2017 - 2018)**:
   - *TOPIK I (Kỳ 52 - 2017)*: Đọc hiểu biểu đồ sinh hoạt, thư điện tử trao đổi công việc, lịch trình du lịch.
   - *TOPIK II (Kỳ 60 - 2018)*: Phân tích tư tưởng tác giả, thành ngữ 4 chữ Hán-Hàn (사자성어), bài báo khoa học đời sống.
4. **Kỳ 64 & Kỳ 83 (Năm 2019 - 2022)**:
   - *TOPIK I (Kỳ 64 - 2019)*: Đối thoại đời thường, đặt lịch hẹn, thói quen tiêu dùng.
   - *TOPIK II (Kỳ 83 - 2022)*: Quán dụng ngữ (관용구), tâm lý học đường, đọc bài luận kinh tế tuần hoàn.
5. **Kỳ 91 & Đề Chuẩn Hóa Mới (2023 - 2026)**:
   - *TOPIK I (Kỳ 91 - 2023)*: Câu hỏi đời sống số, ứng dụng công nghệ, tin nhắn thông báo thông minh.
   - *TOPIK II (Kỳ 94 - 2024)*: Đọc hiểu trí tuệ nhân tạo, biến đổi khí hậu, phân tích biểu đồ xu hướng giới trẻ MZ.
   - *TOPIK II (Đề Chuẩn Hóa 2025 - 2026)*: Bài đọc chuyên sâu cấp độ 5-6, biện luận học thuật, triết học hiện đại.

---

## 3. Nâng Cấp Giao Diện Phòng Thi Thử (`src/components/TopikMockTestView.tsx`)

### A. Thanh Bộ Lọc & Tìm Kiếm Đề Thi Đa Chiều
- **Bộ lọc Cấp độ (Segmented Filter Tabs)**:
  - *Tất cả đề thi* (Tổng số lượng đề).
  - *TOPIK I Sơ cấp (Cấp 1 & 2)*.
  - *TOPIK II Trung cấp (Cấp 3 & 4)*.
  - *TOPIK II Cao cấp (Cấp 5 & 6)*.
- **Thanh Chọn Năm Thi & Kỳ Thi (Timeline Selector)**:
  - Các mốc năm: `Tất cả năm`, `2014 - 2016`, `2017 - 2019`, `2020 - 2022`, `2023 - 2026`.
  - Hiển thị nhãn rõ ràng: Năm thi, Kỳ thi chính thức (Kỳ 35, Kỳ 41, Kỳ 64...).
- **Tìm kiếm nhanh**: Ô tìm kiếm theo từ khóa tên bài thi hoặc số hiệu kỳ thi.

### B. Thẻ Hiển Thị Đề Thi (Exam Card Design)
- Tuân thủ nguyên tắc thiết kế giáo dục (Education & Interactive Simulations):
  - Tiêu đề kỳ thi rõ ràng, phông chữ thanh lịch.
  - Thông tin thời lượng thi (phút), số lượng câu hỏi, số điểm mục tiêu.
  - Nút bấm `Vào Phòng Thi Ngay` nổi bật với hiệu ứng mượt mà.

### C. Giao Diện Phòng Thi Đang Làm (Active Exam Room)
- **Header cố định**:
  - Tên đề thi & số hiệu kỳ thi.
  - Đồng hồ đếm ngược với cảnh báo màu vàng/đỏ khi sắp hết thời gian.
  - Nút nộp bài sớm `Nộp Bài Thi`.
- **Thanh Điều Hướng Câu Hỏi (Question Grid Navigator)**:
  - Cho phép thí sinh chuyển nhanh đến bất kỳ câu hỏi nào.
  - Đánh dấu trạng thái câu đã chọn đáp án (màu xanh lá) và câu chưa làm (màu trắng).
- **Vùng Hiển Thị Câu Hỏi**:
  - Hỗ trợ câu hỏi tiếng Hàn rõ nét, nút loa 🔊 nghe phát âm câu tiếng Hàn.
  - 4 phương án lựa chọn được thiết kế dạng nút bấm tương tác lớn, dễ bấm cả trên điện thoại lẫn máy tính.
- **Màn Hình Kết Quả & Giải Thích Chi Tiết**:
  - Thẻ điểm số tổng quan: Phần trăm chính xác, số câu đúng/sai, xếp hạng đạt/chưa đạt.
  - Danh sách từng câu hỏi kèm đáp án của thí sinh, đáp án đúng (tô xanh) và phần **Giải thích chi tiết bằng tiếng Việt** (ngữ pháp, từ vựng, mẹo giải đề).
  - Hiệu ứng pháo hoa rực rỡ và cộng điểm XP khi vượt qua bài thi.

---

## 4. Kế Hoạch Triển Khai Từng Bước

1. **Bước 1**: Cập nhật kiểu dữ liệu `TopikTest` và `TopikQuestion` trong `src/types.ts` để lưu trữ thêm thông tin năm thi (`year`), số hiệu kỳ thi (`examRound`), và nhãn kỳ thi (`examSession`).
2. **Bước 2**: Xây dựng tệp dữ liệu đề thi các năm `src/data/topikPastExamsData.ts` chứa các bộ đề chọn lọc từ Kỳ 35 (2014) đến các kỳ thi 2024 - 2026.
3. **Bước 3**: Tích hợp dữ liệu vào `src/data/topikTests.ts`, tổng hợp toàn bộ các bộ đề thi TOPIK.
4. **Bước 4**: Nâng cấp component `src/components/TopikMockTestView.tsx` với bộ lọc năm thi, bộ lọc cấp độ, thẻ đề thi trực quan, thanh điều hướng câu hỏi và bảng kết quả chi tiết.
5. **Bước 5**: Kiểm tra tính tương thích, biên dịch (`compile_applet`) và kiểm tra cú pháp (`lint_applet`) đảm bảo không phát sinh lỗi.
