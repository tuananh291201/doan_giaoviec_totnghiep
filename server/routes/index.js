// server/routes/index.js - Tập hợp tất cả các routes của ứng dụng
import express from "express"; // Import thư viện Express để tạo router
import userRoutes from "./userRoute.js"; // Import routes liên quan đến người dùng (user)
import taskRoutes from "./taskRoute.js"; // Import routes liên quan đến công việc (task)
import reportRoutes from "./reportRoute.js"; // Import routes liên quan đến báo cáo (report)

const router = express.Router(); // Tạo một instance của Express Router để quản lý các routes

router.use("/user", userRoutes); // Sử dụng userRoutes cho các endpoint bắt đầu bằng /user
router.use("/task", taskRoutes); // Sử dụng taskRoutes cho các endpoint bắt đầu bằng /task
router.use("/reports", reportRoutes); // Sử dụng reportRoutes cho các endpoint bắt đầu bằng /reports

export default router; // Xuất router để sử dụng trong file chính của server
