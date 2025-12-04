import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    periodFrom: { type: Date },
    periodTo: { type: Date },

    summary: {
      totalTasks: { type: Number, default: 0 },
      todo: { type: Number, default: 0 },
      inProgress: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      overdue: { type: Number, default: 0 },

      // thống kê theo từng nhân viên
      byAssignee: [
        {
          userId: { type: Schema.Types.ObjectId, ref: "User" },
          name: String,
          total: Number,
          completed: Number,
        },
      ],
    },

    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;
