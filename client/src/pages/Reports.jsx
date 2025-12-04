// client/src/pages/Reports.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";

const Reports = () => {
  const { user } = useSelector((state) => state.auth);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  // Chỉ cho giám đốc xem
  if (!user || user.role !== "director") {
    return <div className="p-4">Bạn không có quyền xem trang này.</div>;
  }

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/reports/director", {
        withCredentials: true,
      });
      setReports(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được danh sách báo cáo!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSelectReport = (report) => {
    setSelectedReport(report);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Báo cáo tổng hợp từ Quản lý</h1>

      {loading && <p>Đang tải...</p>}

      {!loading && reports.length === 0 && (
        <p>Hiện chưa có báo cáo nào được gửi.</p>
      )}

      {!loading && reports.length > 0 && (
        <>
          {/* Bảng danh sách báo cáo */}
          <table className="w-full border border-gray-200 text-sm bg-white rounded-xl overflow-hidden mb-6">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Tiêu đề</th>
                <th className="border px-3 py-2 text-left">Từ ngày</th>
                <th className="border px-3 py-2 text-left">Đến ngày</th>
                <th className="border px-3 py-2 text-left">Người gửi</th>
                <th className="border px-3 py-2 text-left">Ngày gửi</th>
                <th className="border px-3 py-2 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td className="border px-3 py-2">{r.title}</td>
                  <td className="border px-3 py-2">
                    {r.periodFrom
                      ? new Date(r.periodFrom).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="border px-3 py-2">
                    {r.periodTo
                      ? new Date(r.periodTo).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="border px-3 py-2">
                    {r.sender?.name || r.sender?.email || "Quản lý"}
                  </td>
                  <td className="border px-3 py-2">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="border px-3 py-2">
                    <button
                      onClick={() => handleSelectReport(r)}
                      className="px-3 py-1 rounded-full text-xs bg-blue-600 text-white"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Khối xem chi tiết báo cáo */}
          {selectedReport && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-2">
                Chi tiết báo cáo: {selectedReport.title}
              </h2>
              {selectedReport.description && (
                <p className="mb-2 text-gray-700">
                  Ghi chú: {selectedReport.description}
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mb-4">
                <div className="p-2 rounded-lg bg-gray-50">
                  <p className="text-gray-500 text-xs">Tổng số công việc</p>
                  <p className="text-lg font-bold">
                    {selectedReport.summary?.totalTasks ?? 0}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50">
                  <p className="text-gray-500 text-xs">Việc cần làm</p>
                  <p className="text-lg font-bold">
                    {selectedReport.summary?.todo ?? 0}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50">
                  <p className="text-gray-500 text-xs">Đang tiến hành</p>
                  <p className="text-lg font-bold">
                    {selectedReport.summary?.inProgress ?? 0}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50">
                  <p className="text-gray-500 text-xs">Hoàn thành</p>
                  <p className="text-lg font-bold">
                    {selectedReport.summary?.completed ?? 0}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50">
                  <p className="text-gray-500 text-xs">Trễ hạn</p>
                  <p className="text-lg font-bold text-red-600">
                    {selectedReport.summary?.overdue ?? 0}
                  </p>
                </div>
              </div>

              {/* Bảng theo từng nhân viên */}
              {selectedReport.summary?.byAssignee &&
                selectedReport.summary.byAssignee.length > 0 && (
                  <>
                    <h3 className="font-semibold mb-2 text-sm">
                      Thống kê theo nhân viên
                    </h3>
                    <table className="w-full border border-gray-200 text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-2 py-1 text-left">
                            Nhân viên
                          </th>
                          <th className="border px-2 py-1 text-left">
                            Tổng việc
                          </th>
                          <th className="border px-2 py-1 text-left">
                            Hoàn thành
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.summary.byAssignee.map((u) => (
                          <tr key={u.userId}>
                            <td className="border px-2 py-1">{u.name}</td>
                            <td className="border px-2 py-1">{u.total}</td>
                            <td className="border px-2 py-1">{u.completed}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
