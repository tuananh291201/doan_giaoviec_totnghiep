import asyncHandler from "express-async-handler";
import Report from "../models/reportModel.js";
import Task from "../models/taskModel.js";
import User from "../models/userModel.js";

// TẠO BÁO CÁO TỔNG HỢP
export const createSummaryReport = asyncHandler(async (req, res) => {
  const { title, description, periodFrom, periodTo } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Tiêu đề là bắt buộc.");
  }

  // Lọc theo ngày nếu có
  const filter = {};
  if (periodFrom || periodTo) {
    filter.date = {};
    if (periodFrom) filter.date.$gte = new Date(periodFrom);
    if (periodTo) filter.date.$lte = new Date(periodTo);
  }

  // Lấy tất cả Task phù hợp
  const tasks = await Task.find(filter).populate("team", "name email");

  // TÍNH TOÁN THEO ĐÚNG SCHEMA CỦA EM
  const totalTasks = tasks.length;
  const todo = tasks.filter((t) => t.stage === "todo").length;
  const inProgress = tasks.filter((t) => t.stage === "in progress").length;
  const completed = tasks.filter((t) => t.stage === "completed").length;
  const overdue = tasks.filter(
    (t) =>
      t.stage !== "completed" &&
      t.date &&
      new Date(t.date) < new Date()
  ).length;

  // THỐNG KÊ THEO MỖI NHÂN VIÊN TRONG 'team'
  const byAssigneeMap = {};
  tasks.forEach((task) => {
    if (!task.team || task.team.length === 0) return;

    task.team.forEach((member) => {
      const id = member._id.toString();

      if (!byAssigneeMap[id]) {
        byAssigneeMap[id] = {
          userId: member._id,
          name: member.name || member.email,
          total: 0,
          completed: 0,
        };
      }

      byAssigneeMap[id].total += 1;
      if (task.stage === "completed") {
        byAssigneeMap[id].completed += 1;
      }
    });
  });

  // LẤY GIÁM ĐỐC
  const director = await User.findOne({ role: "director" });
  if (!director) {
    res.status(400);
    throw new Error("Không tìm thấy tài khoản giám đốc.");
  }

  // LẤY NGƯỜI GỬI (QUẢN LÝ)
  const senderId = req.user?._id || req.user?.userId;
  if (!senderId) {
    res.status(401);
    throw new Error("Không xác định được người gửi.");
  }

  // TẠO BÁO CÁO
  const report = await Report.create({
    title,
    description,
    periodFrom: periodFrom ? new Date(periodFrom) : null,
    periodTo: periodTo ? new Date(periodTo) : null,
    summary: {
      totalTasks,
      todo,
      inProgress,
      completed,
      overdue,
      byAssignee: Object.values(byAssigneeMap),
    },
    sender: senderId,
    receiver: director._id,
  });

  res.status(201).json({
    status: true,
    message: "Đã tạo báo cáo tổng hợp.",
    data: report,
  });
});

// GIÁM ĐỐC XEM BÁO CÁO
export const getReportsForDirector = asyncHandler(async (req, res) => {
  const directorId = req.user?._id || req.user?.userId;

  const reports = await Report.find({ receiver: directorId })
    .populate("sender", "name email")
    .sort({ createdAt: -1 });

  res.json({
    status: true,
    data: reports,
  });
});
