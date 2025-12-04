// server/routes/index.js
import express from "express";
import userRoutes from "./userRoute.js";
import taskRoutes from "./taskRoute.js";
import reportRoutes from "./reportRoute.js"; // 👈 thêm dòng này

const router = express.Router();

router.use("/user", userRoutes);
router.use("/task", taskRoutes);
router.use("/reports", reportRoutes); // 👈 thêm dòng này

export default router;
