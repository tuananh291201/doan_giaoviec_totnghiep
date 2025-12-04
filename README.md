# Hệ Thống Quản Lý Giao Việc (Task Manager System)

Hệ thống quản lý công việc được xây dựng bằng MERN Stack (MongoDB - Express - React - Node.js) phục vụ mô hình giao việc trong công ty.
Hệ thống bao gồm 3 vai trò chính: **Giám đốc**, **Quản lý**, và **Nhân viên**, giúp theo dõi - giao việc - báo cáo một cách rõ ràng và hiệu quả.

---

## Tính năng chính

### Giám đốc
- Nhận báo cáo tổng hợp do quản lý gửi
- Xem thống kê toàn hệ thống:
  - Tổng số công việc
  - Công việc đang tiến hành
  - Công việc đã hoàn thành
  - Công việc trễ hạn
  - Thống kê theo từng nhân viên

---

### Quản lý
- Tạo và quản lý nhân viên
- Quản lý nhóm làm việc
- Giao việc trực tiếp cho nhân viên
- Theo dõi trạng thái mỗi công việc
- Gửi **báo cáo tổng hợp** lên Giám đốc (không cần upload file)
- Xem tiến độ của từng nhân viên

---

### Nhân viên
- Nhận công việc từ quản lý
- Cập nhật trạng thái công việc:
  - `Todo -> In Progress -> Completed`
- Nhận thông báo khi được giao việc mới
- Xem nhiệm vụ theo bảng và theo danh sách

---

## Công nghệ sử dụng

### Frontend
- ReactJS (Vite)
- Redux Toolkit
- TailwindCSS
- Axios
- React Router v6

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Authentication
- Bcrypt (mã hóa mật khẩu)
- Multer (nếu dùng upload file)

---

## Cấu trúc thư mục dự án

giaoviec/
|-- client/   # Frontend React
|-- server/   # Backend Node.js
|-- README.md # File mô tả dự án

---

## Tài khoản & phân quyền

### Mật khẩu mặc định
Tất cả nhân viên mới được tạo từ trang "Nhóm" sẽ có:
- **Password: `123`**

### Các vai trò
- `director`   - Giám đốc
- `manager`    - Quản lý
- `employee`   - Nhân viên

---

## Chức năng báo cáo tổng hợp

Quản lý có thể gửi báo cáo tổng hợp bằng cách:
1. Chọn khoảng thời gian
2. Nhấn nút **"Gửi giám đốc"**
3. Hệ thống tự tính toán:
   - Tổng số task
   - Task hoàn thành
   - Task đang xử lý
   - Task trễ hạn
   - Thống kê theo nhân viên

Giám đốc có trang riêng để xem đầy đủ báo cáo.

---

## Cài đặt & chạy dự án

### 1. Clone dự án
```bash
git clone <link_project>
cd giaoviec
```

### 2. Cài đặt client
```bash
cd client
npm install
npm run dev
```

### 3. Cài đặt server
```bash
cd server
npm install
npm start
```

---

## Kiểm thử nhanh
- Tạo nhân viên mới trong mục Nhóm
- Đăng nhập bằng email vừa tạo, mật khẩu `123`
- Giao công việc để kiểm thử luồng xử lý
- Gửi báo cáo để kiểm thử vai trò Giám đốc

---

## Ghi chú quan trọng
- JWT được lưu trong cookie httpOnly để tăng bảo mật.
