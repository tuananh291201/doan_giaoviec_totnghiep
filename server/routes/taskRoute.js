import express from "express";
import {
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
} from "../controllers/taskController.js";
import { isAdminRoute, protectRoute } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/create", protectRoute, createTask);
router.post(
  "/activity/:id",
  protectRoute,
  upload.array("proofs", 5),
  postTaskActivity
);
router.post(
  "/upload-assets",
  protectRoute,
  upload.array("assets", 10),
  uploadTaskAssets
);

router.get("/dashboard", protectRoute, dashboardStatistics);
router.get("/", protectRoute, getTasks);
router.get("/:id", protectRoute, getTask);

//router.put("/create-subtask/:id", protectRoute, isAdminRoute, createSubTask);
router.put("/update/:id", protectRoute, isAdminRoute, updateTask);
router.put("/change-stage/:id", protectRoute, updateTaskStage);
// router.put(
//   "/change-status/:taskId/:subTaskId",
//   protectRoute,
//   updateSubTaskStage
// );
router.put("/:id", protectRoute, isAdminRoute, trashTask);

router.delete(
  "/delete-restore/:id?",
  protectRoute,
  isAdminRoute,
  deleteRestoreTask
);

export default router;
