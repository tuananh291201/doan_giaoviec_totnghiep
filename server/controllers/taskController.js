import asyncHandler from "express-async-handler";
import Notice from "../models/notis.js";
import Task from "../models/taskModel.js";
import User from "../models/userModel.js";
import path from "path";

// TẠO TASK (admin & nhân viên)
const createTask = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, team, stage, date, priority, assets, links, description } =
      req.body;

    if (!title || !stage || !date || !priority) {
      return res
        .status(400)
        .json({ status: false, message: "Các trường bắt buộc bị thiếu." });
    }

    // thông báo cho người dùng về công việc
    let text = "Công việc mới đã được gán cho bạn";
    const inputTeam = Array.isArray(team) ? team : [];

    if (inputTeam.length > 1) {
      text = text + ` và ${inputTeam.length - 1} người khác.`;
    }

    text =
      text +
      ` Mức độ ưu tiên được đặt là ${priority}, vì vậy hãy kiểm tra và hành động phù hợp. Ngày công việc là ${new Date(
        date
      ).toDateString()}. Cảm ơn bạn!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };

    let newLinks = null;
    if (links) {
      // Normalize links: accept string (comma-separated) or array
      const linkList =
        typeof links === "string"
          ? links
              .split(",")
              .map((l) => l.trim())
              .filter((l) => l)
          : Array.isArray(links)
          ? links.filter((l) => l)
          : [];
      newLinks = linkList;
    }

    const taskTeam =
      inputTeam && inputTeam.length > 0 ? inputTeam : [userId];

    const task = await Task.create({
      title,
      team: taskTeam,
      stage: stage.toLowerCase(),
      date,
      priority: priority.toLowerCase(),
      assets,
      activities: activity,
      links: newLinks || [],
      description,
    });

    await Notice.create({
      team: taskTeam,
      text,
      task: task._id,
    });

    const users = await User.find({
      _id: taskTeam,
    });

    if (users && users.length > 0) {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        await User.findByIdAndUpdate(user._id, {
          $inc: { unreadNotis: 1 },
        });
      }
    }

    return res.status(201).json({
      status: true,
      message: "Tạo công việc thành công.",
      task,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: error.message });
  }
});

// Upload assets cho task (ảnh/PDF), trả về URL tĩnh từ server
const uploadTaskAssets = asyncHandler(async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res
        .status(400)
        .json({ status: false, message: "Khong co file duoc tai len." });
    }

    const urls = files.map((f) => {
      const rel = path.join("/uploads", f.filename).replace(/\\/g, "/");
      return rel;
    });

    return res.status(200).json({
      status: true,
      message: "Tai file thanh cong",
      urls,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: error.message });
  }
});

// THỐNG KÊ DASHBOARD
const dashboardStatistics = asyncHandler(async (req, res) => {
  try {
    const { filterType } = req.query;

    let query = { isTrashed: false };
    let sort = { createdAt: -1 };

    // xử lý filter (hôm nay, tuần này, tháng này, ...)
    if (filterType === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      query.createdAt = {
        $gte: today,
        $lt: tomorrow,
      };
    } else if (filterType === "thisWeek") {
      const today = new Date();
      const firstDayOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay())
      );
      const lastDayOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay() + 6)
      );

      firstDayOfWeek.setHours(0, 0, 0, 0);
      lastDayOfWeek.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: firstDayOfWeek,
        $lte: lastDayOfWeek,
      };
    } else if (filterType === "thisMonth") {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );

      firstDayOfMonth.setHours(0, 0, 0, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
      };
    }

    const totalTasks = await Task.countDocuments(query);
    const last10Task = await Task.find(query)
      .sort(sort)
      .limit(10)
      .populate({
        path: "team",
        select: "name role",
      });

    const groupedTasks = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$stage",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          totalTasks: "$count",
        },
      },
    ]);

    const allTasks = await Task.find(query);

    const graphData = Object.entries(
      allTasks.reduce((result, task) => {
        const { priority } = task;
        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    const summary = {
      totalTasks,
      last10Task,
      tasks: groupedTasks,
      graphData,
    };

    return res.status(200).json({
      status: true,
      summary,
      message: "Thành công.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: error.message });
  }
});

// CẬP NHẬT THÔNG TIN TASK
const updateTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      team,
      stage,
      date,
      priority,
      assets,
      links,
      description,
    } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res
        .status(404)
        .json({ status: false, message: "Không tìm thấy công việc." });
    }

    task.title = title || task.title;
    task.team = team || task.team;
    task.stage = stage ? stage.toLowerCase() : task.stage;
    task.date = date || task.date;
    task.priority = priority
      ? priority.toLowerCase()
      : task.priority;
    task.assets = assets || task.assets;
    task.links = links || task.links;
    task.description = description || task.description;

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Cập nhật công việc thành công.", task });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: error.message });
  }
});

// ĐỔI STAGE CỦA TASK (To-do / In-progress / Completed)
const updateTaskStage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res
        .status(404)
        .json({ status: false, message: "Không tìm thấy công việc." });
    }

    task.stage = stage.toLowerCase();

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Cập nhật trạng thái công việc thành công.", task });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: error.message });
  }
});

// LẤY DANH SÁCH TASK
const getTasks = asyncHandler(async (req, res) => {
  try {
    const { search, stage, priority, sortBy, page, limit, trash, date } =
      req.query;

    let query = {
      isTrashed: trash === "true",
    };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (stage) {
      query.stage = stage;
    }

    if (priority) {
      query.priority = priority;
    }

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);

      query.date = {
        $gte: start,
        $lt: end,
      };
    }

    let sort = { createdAt: -1 };

    if (sortBy === "latest") {
      sort = { createdAt: -1 };
    } else if (sortBy === "oldest") {
      sort = { createdAt: 1 };
    } else if (sortBy === "priority") {
      sort = { priority: -1 };
    }

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const queryResult = Task.find(query)
      .populate({
        path: "team",
        select: "name title role email",
      })
      .populate({
        path: "activities.by",
        select: "name email",
      })
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    const tasks = await queryResult;
    const total = await Task.countDocuments(query);

    return res.status(200).json({
      status: true,
      tasks,
      total,
      message: "Thành công.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: error.message });
  }
});

// LẤY CHI TIẾT 1 TASK
const getTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate({
        path: "team",
        select: "name title role email",
      })
      .populate({
        path: "activities.by",
        select: "name email",
      });

    if (!task) {
      return res
        .status(404)
        .json({ status: false, message: "Không tìm thấy công việc." });
    }

    res.status(200).json({ status: true, task });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: error.message });
  }
});

// THÊM ACTIVITY (bình luận / log)
const postTaskActivity = asyncHandler(async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    const { id } = req.params;
    const { type, activity } = req.body;
    const proofFiles =
      req.files?.map((file) => `/uploads/${file.filename}`) || [];

    const task = await Task.findById(id);

    if (!task) {
      return res
        .status(404)
        .json({ status: false, message: "Không tìm thấy công việc." });
    }

    // thêm activity mới vào công việc
    task.activities.push({
      type,
      activity,
      proofs: proofFiles,
      by: userId,
      date: new Date(),
    });

    await task.save();

    // nếu nhân viên yêu cầu hoàn thành công việc -> gửi thông báo cho admin/QL
    if (type === "completed" && !isAdmin) {
      const admins = await User.find({ isAdmin: true, isActive: true }).select(
        "_id name"
      );
      const adminIds = admins.map((u) => u._id);

      if (adminIds.length > 0) {
        const user = await User.findById(userId).select("name");
        const text = `${
          user?.name || "Nhân viên"
        } yêu cầu hoàn thành công việc: "${task.title}". Vui lòng xem xét và phê duyệt.`;

        await Notice.create({
          team: adminIds,
          text,
          task: task._id,
          notiType: "alert",
        });

        // tăng số thông báo chưa đọc cho admin
        await User.updateMany(
          { _id: { $in: adminIds } },
          { $inc: { unreadNotis: 1 } }
        );
      }
    }

    res
      .status(200)
      .json({ status: true, message: "Hoạt động được thêm thành công." });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: error.message });
  }
});

// CHUYỂN TASK VÀO THÙNG RÁC
const trashTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res
        .status(404)
        .json({ status: false, message: "Khong tim thay cong viec." });
    }

    task.isTrashed = true;

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Cong viec duoc chuyen den thung rac." });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: error.message });
  }
});

const deleteRestoreTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const action = req.query.actionType || req.query.type;

    if (!action) {
      return res
        .status(400)
        .json({ status: false, message: "Thieu tham so hanh dong." });
    }

    if (action === "deleteAll") {
      await Task.deleteMany({ isTrashed: true });
      return res
        .status(200)
        .json({ status: true, message: "Da xoa tat ca cong viec trong thung rac." });
    }

    if (action === "restoreAll") {
      await Task.updateMany({ isTrashed: true }, { isTrashed: false });
      return res
        .status(200)
        .json({ status: true, message: "Da khoi phuc tat ca cong viec." });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res
        .status(404)
        .json({ status: false, message: "Khong tim thay cong viec." });
    }

    if (action === "delete") {
      await Task.findByIdAndDelete(id);
      return res
        .status(200)
        .json({ status: true, message: "Da xoa cong viec." });
    }

    if (action === "restore") {
      task.isTrashed = false;
      await task.save();
      return res
        .status(200)
        .json({ status: true, message: "Da khoi phuc cong viec." });
    }

    return res
      .status(400)
      .json({ status: false, message: "Hanh dong khong hop le." });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: error.message });
  }
});

export {
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  getTask,
  getTasks,
  postTaskActivity,
  trashTask,
  updateTask,
  updateTaskStage,
  uploadTaskAssets,
};
