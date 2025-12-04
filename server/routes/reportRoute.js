import express from "express";
import { protectRoute, isAdminRoute } from "../middleware/authMiddleware.js";
import {
  createSummaryReport,
  getReportsForDirector,
} from "../controllers/reportController.js";

const router = express.Router();

// QUẢN LÝ TẠO BÁO CÁO TỔNG HỢP
router.post("/summary", protectRoute, isAdminRoute, createSummaryReport);

// GIÁM ĐỐC XEM BÁO CÁO
router.get("/director", protectRoute, getReportsForDirector);

export default router;
