# WEB APP TRẮC NGHIỆM ÔN TẬP CÔNG BINH 2026

Ứng dụng web trắc nghiệm hoàn chỉnh, hiện đại, gọn nhẹ, tối ưu 100% cho việc học tập, ôn luyện và kiểm tra kiến thức.

- **Dữ liệu chuẩn**: Đã nạp sẵn toàn bộ **250 câu hỏi** trắc nghiệm kèm đáp án chính thức theo văn bản của **Trường Sĩ quan Công binh** (Phòng Tham mưu - Hành chính):
  1. **Tham mưu tác chiến**: 100 câu
  2. **Công tác Đảng, Công tác chính trị (CTĐ, CTCT)**: 50 câu
  3. **Hậu cần – Kỹ thuật**: 50 câu
  4. **Nghiệp vụ Nhân viên đồ bản**: 50 câu
- **Không tốn chi phí**: 100% miễn phí, không cần mua server, không cần hosting trả phí, không cần database.
- **Tiện lợi cho người học**: Người học không cần cài đặt bất kỳ phần mềm nào, chỉ cần nhấp vào **LINK** trên điện thoại, máy tính bảng hoặc máy tính là làm bài được ngay.
- **Duy trì một Link cố định**: Sau này khi bạn sửa đổi câu hỏi, bổ sung đáp án và cập nhật lại, **LINK WEBSITE VẪN GIỮ NGUYÊN**.

---

## 🚀 1. HƯỚNG DẪN ĐƯA LÊN GITHUB PAGES (TRIỂN KHAI MIỄN PHÍ)

### Bước 1: Tạo Repository mới trên GitHub
1. Đăng nhập vào [GitHub](https://github.com).
2. Bấm nút **New** (hoặc dấu `+` ở góc trên bên phải) để tạo repository mới.
3. Đặt tên repository (ví dụ: `trac-nghiem` hoặc `on-tap-cong-binh`).
4. Chọn chế độ **Public** (Công khai).
5. Bấm **Create repository**.

### Bước 2: Tải code từ máy tính lên GitHub
Mở PowerShell hoặc Command Prompt tại thư mục dự án `d:\TRAC N` và chạy các lệnh:

```bash
git init
git add .
git commit -m "Khoi tao web app trac nghiem Cong binh 2026"
git branch -M main
git remote add origin https://github.com/<tai-khoan-cua-ban>/trac-nghiem.git
git push -u origin main
```
*(Thay `<tai-khoan-cua-ban>` bằng username GitHub của bạn)*

### Bước 3: Kích hoạt GitHub Pages (Tự động deploy qua GitHub Actions)
Trong thư mục `.github/workflows/deploy.yml` đã được cài đặt sẵn quy trình tự động build và deploy:
1. Vào repository trên GitHub của bạn, chọn tab **Settings** (Cài đặt).
2. Ở menu bên trái, chọn **Pages**.
3. Tại mục **Build and deployment** -> **Source**, chọn: **GitHub Actions**.
4. GitHub sẽ tự động chạy quy trình build và đưa website lên mạng trong khoảng 1 phút.

### Bước 4: Lấy LINK và gửi cho người học
- Link website của bạn sẽ có dạng:
  ```
  https://<tai-khoan-cua-ban>.github.io/trac-nghiem/
  ```
- Bạn chỉ cần copy link này gửi qua Zalo, Messenger, Email hoặc quét mã QR. Bất kỳ ai mở link cũng có thể ôn luyện ngay lập tức!

---

## ✏️ 2. CÁCH CHỈNH SỬA VÀ CẬP NHẬT CÂU HỎI

Bạn muốn sửa một câu hỏi (ví dụ sửa câu số 25, hoặc thêm câu mới), hãy làm theo 1 trong 2 cách cực kỳ đơn giản sau:

### Cách 1: Chỉnh sửa trực quan trên giao diện Quản trị của Web (Khuyên dùng)
1. Mở trang web trắc nghiệm của bạn.
2. Bấm vào nút **Quản trị** (biểu tượng bánh răng ⚙️ ở góc trên bên phải).
3. Tìm câu hỏi cần sửa, bấm biểu tượng chiếc bút chì ✏️ để sửa nội dung, sửa phương án, hoặc chọn lại đáp án đúng.
4. Bấm **"XUẤT QUESTIONS.JSON"** để tải file `questions.json` đã cập nhật về máy.
5. Sao chép đè file `questions.json` này vào thư mục `src/data/questions.json` trong thư mục dự án.
6. Chạy lệnh:
   ```bash
   git add .
   git commit -m "Cap nhat noi dung cau hoi"
   git push
   ```
👉 **Kết quả**: GitHub Pages sẽ tự động cập nhật câu hỏi mới trong vòng 1 phút, **LINK WEBSITE CỦA BẠN VẪN GIỮ NGUYÊN KHÔNG ĐỔI**!

### Cách 2: Chỉnh sửa trực tiếp file `src/data/questions.json`
Mở file `src/data/questions.json` bằng VS Code, Notepad hoặc bất kỳ trình soạn thảo nào, tìm đến câu hỏi cần sửa và chỉnh nội dung, sau đó `git push`.

---

## 🎯 3. CÁC TÍNH NĂNG NỔI BẬT ĐÃ ĐƯỢC XÂY DỰNG

### 1. Chế độ LUYỆN TẬP
- Nhấp chọn đáp án: Hệ thống **báo Đúng/Sai ngay lập tức**.
- Nếu chọn sai: Tô đỏ đáp án đã chọn, đồng thời làm nổi bật màu xanh đáp án đúng.
- Hiển thị khung **giải thích căn cứ điều lệnh** chi tiết.
- Không tải lại trang, không giật lag.

### 2. Chế độ THI THỬ
- Không hiện đáp án trong lúc làm bài.
- Có đồng hồ đếm ngược với cảnh báo đổi màu khi sắp hết thời gian.
- Tự do đảo ngẫu nhiên thứ tự câu hỏi và thứ tự các đáp án A, B, C, D.
- Tự do chuyển câu, quay lại sửa đáp án bất kỳ lúc nào.
- Xem danh sách lưới câu hỏi để biết câu nào đã làm, câu nào chưa làm.
- Nút **NỘP BÀI** có thông báo xác nhận và cảnh báo số câu chưa làm.
- **Màn hình Kết quả**:
  - Chấm điểm chuẩn thang điểm 10 (ví dụ: `8.5 / 10`).
  - Thống kê chi tiết: số câu đúng, số câu sai, tỷ lệ %, thời gian làm bài.
  - Hiệu ứng pháo hoa khi đạt điểm giỏi/xuất sắc (>= 8.0).
  - Nút **[XEM CÂU SAI]** để lọc xem lại các lỗi đã mắc kèm giải thích.
  - Nút **[LÀM LẠI BÀI THI]** hoặc **[THI LẠI CÁC CÂU SAI]**.

### 3. Phím tắt tiện lợi trên Laptop/Máy tính
- Phím `1`: Chọn đáp án A
- Phím `2`: Chọn đáp án B
- Phím `3`: Chọn đáp án C
- Phím `4`: Chọn đáp án D
- Phím `←` (Mũi tên trái): Quay lại câu trước
- Phím `→` (Mũi tên phải): Sang câu tiếp theo
- Phím `Enter`: Chuyển câu kế tiếp / Mở hộp xác nhận nộp bài

### 4. Đánh dấu (Bookmark) câu hỏi khó
- Bấm biểu tượng ngôi sao ★ để gắn cờ các câu hỏi cần chú ý.
- Ngoài trang chủ có nút bấm ôn tập riêng các câu đã gắn sao.

### 5. Lưu tiến độ cục bộ (localStorage)
- Tự động lưu tiến độ làm dở: nếu lỡ tay đóng tab hay reload trang, khi mở lại sẽ có nút **[Tiếp tục bài đang làm]**.
- Ghi nhận các câu từng làm sai trên thiết bị để người học dễ dàng luyện lại.

### 6. Giao diện & Trải nghiệm
- Thiết kế Modern Minimal, tông màu quân chủng Công binh hiện đại, thanh lịch.
- Hỗ trợ đầy đủ **Chế độ Sáng (Light Mode)** và **Chế độ Tối (Dark Mode)**.
- Phông chữ tiếng Việt chuẩn đẹp: **Be Vietnam Pro** và **Inter**.
- Tối ưu 100% cho màn hình cảm ứng điện thoại: nút bấm to, rõ ràng, dễ thao tác ngón tay.

---

## 💻 4. LỆNH CHẠY THỬ TRÊN MÁY TÍNH CỦA BẠN (LOCAL)

Nếu bạn muốn chạy thử nghiệm trên máy trước khi đưa lên mạng:

```bash
# Cài đặt thư viện (chỉ chạy 1 lần đầu)
npm install

# Khởi động máy chủ thử nghiệm
npm run dev
```

Mở trình duyệt truy cập: `http://localhost:5173/`

Khi muốn đóng gói:
```bash
npm run build
```
Thư mục `dist/` chứa toàn bộ mã nguồn tĩnh sẵn sàng deploy ở mọi nơi.
