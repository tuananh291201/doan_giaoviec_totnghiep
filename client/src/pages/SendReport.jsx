// client/src/pages/SendReport.jsx
import React, { useState } from "react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import axios from "axios";

const SendReport = () => {
  const { user } = useSelector((state) => state.auth);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");

  // chỉ cho quản lý (isAdmin) dùng
  if (!user?.isAdmin) {
    return <div className="p-4">Bạn không có quyền sử dụng tính năng này.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title) {
      return toast.error("Bạn phải nhập tiêu đề!");
    }

    try {
      await axios.post(
        "/api/reports/summary",
        {
          title,
          description,
          periodFrom,
          periodTo,
        },
        { withCredentials: true }
      );

      toast.success("Đã tạo báo cáo tổng hợp!");
      setTitle("");
      setDescription("");
      setPeriodFrom("");
      setPeriodTo("");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tạo báo cáo!");
    }
  };

  return (
    <div className="p-6 max-w-2xl bg-white rounded-xl shadow-sm">
      <h1 className="text-xl font-bold mb-4">Tạo báo cáo tổng hợp công việc</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Tiêu đề báo cáo"
          className="border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Mô tả"
          className="border p-2 rounded min-h-[80px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex gap-2">
          <input
            type="date"
            className="border p-2 rounded flex-1"
            value={periodFrom}
            onChange={(e) => setPeriodFrom(e.target.value)}
          />
          <input
            type="date"
            className="border p-2 rounded flex-1"
            value={periodTo}
            onChange={(e) => setPeriodTo(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-full mt-2"
        >
          Tổng hợp & Gửi giám đốc
        </button>
      </form>
    </div>
  );
};

export default SendReport;
