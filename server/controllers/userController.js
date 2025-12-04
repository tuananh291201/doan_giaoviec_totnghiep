import asyncHandler from "express-async-handler";
import Notice from "../models/notis.js";
import User from "../models/userModel.js";
import createJWT from "../utils/index.js";

// POST request - đăng nhập người dùng
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(401)
      .json({ status: false, message: "Email hoặc mật khẩu không hợp lệ." });
  }

  if (!user?.isActive) {
    return res.status(401).json({
      status: false,
      message:
        "Tài khoản người dùng đã bị vô hiệu hóa, liên hệ với quản trị viên",
    });
  }

  const isMatch = await user.matchPassword(password);

  if (user && isMatch) {
    createJWT(res, user._id);

    user.password = undefined;

    res.status(200).json(user);
  } else {
    return res
      .status(401)
      .json({ status: false, message: "Email hoặc mật khẩu không hợp lệ" });
  }
});

// POST - Đăng ký người dùng mới
const registerUser = asyncHandler(async (req, res) => {
  let { name, email, password, isAdmin, role, title } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res
      .status(400)
      .json({ status: false, message: "Địa chỉ email đã tồn tại" });
  }

  // 🔹 MẬT KHẨU MẶC ĐỊNH = "123" NẾU FE KHÔNG GỬI LÊN
  if (!password) {
    password = "123";
  }

  const user = await User.create({
    name,
    email,
    password,
    isAdmin,
    role,
    title,
  });

  if (user) {
    if (isAdmin) {
      createJWT(res, user._id);
    }

    user.password = undefined;

    res.status(201).json(user);
  } else {
    return res
      .status(400)
      .json({ status: false, message: "Dữ liệu người dùng không hợp lệ" });
  }
});

// POST - Đăng xuất người dùng / xóa cookie
const logoutUser = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Đã đăng xuất thành công" });
};

const getTeamList = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let query = {};

  if (search) {
    const searchQuery = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };
    query = { ...query, ...searchQuery };
  }

  const user = await User.find(query).select(
    "name title role email isActive"
  );

  res.status(201).json(user);
});

// @GET  - get user notifications
const getNotificationsList = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const notice = await Notice.find({
    team: userId,
    isRead: { $nin: [userId] },
  })
    .populate("task", "title")
    .sort({ _id: -1 });

  res.status(200).json(notice);
});

// @GET  - get user task status
const getUserTaskStatus = asyncHandler(async (req, res) => {
  const tasks = await User.find()
    .populate("tasks", "title stage")
    .sort({ _id: -1 });

  res.status(200).json(tasks);
});

// @GET  - mark notification read
const markNotificationRead = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.user;
    const { isReadType, id } = req.query;

    if (isReadType === "all") {
      await Notice.updateMany(
        { team: userId, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    } else {
      await Notice.findOneAndUpdate(
        { _id: id, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    }
    res.status(201).json({ status: true, message: "Hoàn thành" });
  } catch (error) {
    console.log(error);
  }
});

// PUT - Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const { userId, isAdmin } = req.user;
  const { _id } = req.body;

  const id =
    isAdmin && userId === _id
      ? userId
      : isAdmin && userId !== _id
      ? _id
      : userId;

  const user = await User.findById(id);

  if (user) {
    user.name = req.body.name || user.name;
    // user.email = req.body.email || user.email;
    user.title = req.body.title || user.title;
    user.role = req.body.role || user.role;

    const updatedUser = await user.save();

    user.password = undefined;

    res.status(201).json({
      status: true,
      message: "Hồ sơ được cập nhật thành công.",
      user: updatedUser,
    });
  } else {
    res
      .status(404)
      .json({ status: false, message: "Không tìm thấy người dùng" });
  }
});

// PUT - active/disactivate user profile
const activateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (user) {
    user.isActive = req.body.isActive;

    await user.save();

    user.password = undefined;

    res.status(201).json({
      status: true,
      message: `Tài khoản người dùng đã được ${
        user?.isActive ? "kích hoạt" : "vô hiệu hóa"
      }`,
    });
  } else {
    res
      .status(404)
      .json({ status: false, message: "Không tìm thấy người dùng" });
  }
});

const changeUserPassword = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  // Xóa điều kiện user demo nếu muốn
  if (userId === "65ff94c7bb2de638d0c73f63") {
    return res.status(404).json({
      status: false,
      message:
        "Đây là người dùng kiểm tra. Bạn không thể thay đổi mật khẩu. Cảm ơn!!!",
    });
  }

  const user = await User.findById(userId);

  if (user) {
    user.password = req.body.password;

    await user.save();

    user.password = undefined;

    res.status(201).json({
      status: true,
      message: `Mật khẩu đã thay đổi thành công.`,
    });
  } else {
    res
      .status(404)
      .json({ status: false, message: "Không tìm thấy người dùng" });
  }
});

// DELETE - delete user account
const deleteUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await User.findByIdAndDelete(id);

  res
    .status(200)
    .json({ status: true, message: "Người dùng đã bị xóa thành công" });
});

export {
  activateUserProfile,
  changeUserPassword,
  deleteUserProfile,
  getNotificationsList,
  getTeamList,
  getUserTaskStatus,
  loginUser,
  logoutUser,
  markNotificationRead,
  registerUser,
  updateUserProfile,
};
