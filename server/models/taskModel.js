import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    // dùng Date.now để mỗi lần tạo task có thời gian đúng
    date: { type: Date, default: Date.now },
    priority: {
      type: String,
      default: "normal",
      enum: ["high", "medium", "normal", "low"],
    },
    stage: {
      type: String,
      default: "todo",
      enum: ["todo", "in progress", "completed"],
    },
    activities: [
      {
        type: {
          type: String,
          default: "assigned",
          enum: [
            "assigned",
            "started",
            "in progress",
            "bug",
            "completed",
            "commented",
          ],
        },
        activity: String,
        // KHÔNG dùng new Date() trực tiếp, mà dùng Date.now
        date: { type: Date, default: Date.now },
        by: { type: Schema.Types.ObjectId, ref: "User" },
        proofs: [String],
      },
    ],
    subTasks: [
      {
        title: String,
        date: Date,
        tag: String,
        isCompleted: Boolean,
      },
    ],
    description: String,
    assets: [String],
    links: [String],
    team: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isTrashed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
