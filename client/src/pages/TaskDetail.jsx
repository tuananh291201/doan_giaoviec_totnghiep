// TaskDetail.jsx - Trang chi tiết công việc, hiển thị thông tin task và hoạt động
import clsx from "clsx"; // Thư viện để kết hợp class CSS động
import moment from "moment"; // Thư viện xử lý thời gian
import "moment/locale/vi"; // Import locale tiếng Việt cho moment
import React, { useState } from "react"; // React và hook useState
import { FaBug, FaSpinner, FaTasks, FaThumbsUp, FaUser } from "react-icons/fa"; // Icons từ react-icons
import { GrInProgress } from "react-icons/gr"; // Icon tiến trình
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineDoneAll,
  MdOutlineMessage,
  MdTaskAlt,
} from "react-icons/md"; // Icons từ material design
import { RxActivityLog } from "react-icons/rx"; // Icon hoạt động
import { useParams } from "react-router-dom"; // Hook lấy params từ URL
import { useSelector } from "react-redux"; // Hook lấy state từ Redux
import { toast } from "sonner"; // Thư viện hiển thị thông báo
import { Button, Loading, Tabs } from "../components"; // Components tùy chỉnh
import { TaskColor } from "../components/tasks"; // Component màu task
import {
  useGetSingleTaskQuery,
  usePostTaskActivityMutation,
} from "../redux/slices/api/taskApiSlice"; // Hooks RTK Query cho API task
import { PRIOTITYSTYELS, TASK_TYPE, getInitials, STAGE_LABELS } from "../utils"; // Utilities và constants

// --- Cấu hình tiếng Việt cho moment để hiển thị thời gian tương đối ---
moment.locale("vi"); // Đặt locale thành tiếng Việt
moment.updateLocale("vi", {
  relativeTime: {
    future: "trong %s", // Thời gian tương lai
    past: "%s trước", // Thời gian quá khứ
    s: "vài giây", // Giây
    ss: "%d giây", // Nhiều giây
    m: "1 phút", // 1 phút
    mm: "%d phút", // Nhiều phút
    h: "1 giờ", // 1 giờ
    hh: "%d giờ", // Nhiều giờ
    d: "1 ngày", // 1 ngày
    dd: "%d ngày", // Nhiều ngày
    M: "1 tháng", // 1 tháng
    MM: "%d tháng", // Nhiều tháng
    y: "1 năm", // 1 năm
    yy: "%d năm", // Nhiều năm
  },
});

moment.relativeTimeThreshold("s", 59); // Ngưỡng cho giây
moment.relativeTimeThreshold("ss", 59); // Ngưỡng cho nhiều giây
moment.relativeTimeRounding(Math.floor); // Làm tròn thời gian

// Hàm định dạng thời gian tương đối bằng tiếng Việt
const formatRelativeTime = (value) => {
  const target = value ? moment(value) : null; // Tạo đối tượng moment từ giá trị
  if (!target || !target.isValid()) return ""; // Kiểm tra hợp lệ
  const diffSeconds = moment().diff(target, "seconds"); // Tính chênh lệch giây
  if (diffSeconds < 60) { // Nếu dưới 1 phút
    const seconds = Math.max(diffSeconds, 1); // Ít nhất 1 giây
    return seconds <= 1 ? "vài giây trước" : `${seconds} giây trước`; // Trả về chuỗi tiếng Việt
  }
  return target.fromNow(); // Sử dụng moment để định dạng
};

// Mảng URL hình ảnh mẫu cho tài nguyên
const assets = [
  "https://images.pexels.com/photos/2418664/pexels-photo-2418664.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/8797307/pexels-photo-8797307.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/2534523/pexels-photo-2534523.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/804049/pexels-photo-804049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
];

// Mapping icon cho mức độ ưu tiên
const ICONS = {
  high: <MdKeyboardDoubleArrowUp />, // Icon mũi tên đôi lên cho cao
  medium: <MdKeyboardArrowUp />, // Icon mũi tên lên cho trung bình
  low: <MdKeyboardArrowDown />, // Icon mũi tên xuống cho thấp
};

// Màu nền cho mức độ ưu tiên
const bgColor = {
  high: "bg-red-200", // Màu đỏ nhạt cho cao
  medium: "bg-yellow-200", // Màu vàng nhạt cho trung bình
  low: "bg-blue-200", // Màu xanh nhạt cho thấp
};

// Cấu hình các tab trong trang chi tiết
const TABS = [
  { title: "Chi tiết công việc", icon: <FaTasks /> }, // Tab chi tiết task
  { title: "Hoạt động/Dòng thời gian", icon: <RxActivityLog /> }, // Tab hoạt động
];

// Mapping icon cho loại hoạt động task
const TASKTYPEICON = {
  // Icon cho bình luận
  commented: (
    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
      <MdOutlineMessage />
    </div>
  ),
  // Icon cho bắt đầu
  started: (
    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
      <FaThumbsUp size={20} />
    </div>
  ),
  // Icon cho gán việc
  assigned: (
    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-500 text-white">
      <FaUser size={14} />
    </div>
  ),
  // Icon cho lỗi
  bug: (
    <div className="text-red-600">
      <FaBug size={24} />
    </div>
  ),
  // Icon cho hoàn thành
  completed: (
    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
      <MdOutlineDoneAll size={24} />
    </div>
  ),
  // Icon cho đang tiến hành
  "in progress": (
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-600 text-white">
      <GrInProgress size={16} />
    </div>
  ),
};

// Danh sách loại hoạt động có thể chọn
const act_types = [
  { label: "Bắt đầu", value: "started" }, // Bắt đầu task
  { label: "Hoàn thành", value: "completed" }, // Hoàn thành task
  { label: "Đang tiến hành", value: "in progress" }, // Đang làm
  { label: "Lỗi", value: "bug" }, // Báo lỗi
  { label: "Gán việc", value: "assigned" }, // Gán cho ai đó
];

// Mapping nhãn cho hoạt động
const ACTIVITY_LABELS = {
  commented: "Trao đổi", // Bình luận
  started: "Bắt đầu", // Khởi động
  completed: "Hoàn thành", // Kết thúc
  "in progress": "Đang tiến hành", // Tiến hành
  bug: "Lỗi", // Lỗi
  assigned: "Gán việc", // Phân công
};

// Component Activities: Hiển thị và thêm hoạt động cho task
const Activities = ({ activity, id, refetch }) => {
  const [selected, setSelected] = useState(act_types[0].value); // State chọn loại hoạt động
  const [text, setText] = useState(""); // State nội dung hoạt động
  const [files, setFiles] = useState([]); // State file đính kèm

  const [postActivity, { isLoading }] = usePostTaskActivityMutation(); // Hook gửi hoạt động

  // Hàm xử lý gửi hoạt động
  const handleSubmit = async () => {
    try {
      const now = new Date().toISOString(); // Thời điểm client gửi

      const formData = new FormData(); // Tạo FormData để gửi file
      formData.append("type", selected); // Thêm loại hoạt động
      formData.append("activity", text); // Thêm nội dung
      formData.append("date", now); // Gửi luôn date
      (files || []).forEach((file) => formData.append("proofs", file)); // Thêm file chứng minh

      const res = await postActivity({ // Gọi API gửi hoạt động
        data: formData,
        id,
      }).unwrap();
      setText(""); // Reset text
      setFiles([]); // Reset files
      toast.success(res?.message); // Hiển thị thông báo thành công
      refetch(); // Refresh dữ liệu
    } catch (err) {
      console.log(err); // Log lỗi
      toast.error(err?.data?.message || err.error); // Hiển thị lỗi
    }
  };

  // Component Card: Hiển thị từng hoạt động
  const Card = ({ item }) => {
    return (
      <div className={`flex space-x-4`}> // Container cho card
        <div className="flex flex-col items-center flex-shrink-0"> // Cột trái cho icon
          <div className="w-10 h-10 flex items-center justify-center"> // Icon loại hoạt động
            {TASKTYPEICON[item?.type]}
          </div>
          <div className="h-full flex items-center"> // Đường kẻ dọc
            <div className="w-0.5 bg-gray-300 h-full"></div>
          </div>
        </div>

        <div className="flex flex-col gap-y-1 mb-8"> // Nội dung hoạt động
          <p className="font-semibold">{item?.by?.name}</p> // Tên người thực hiện
          <div className="text-gray-500 space-x-2"> // Loại và thời gian
            <span className="capitalize">
              {ACTIVITY_LABELS[item?.type] || item?.type} // Nhãn loại
            </span>
            <span className="text-sm">
              {moment(item?.date || item?.createdAt).fromNow()} // Thời gian tương đối
            </span>
          </div>
          <div className="text-gray-700">{item?.activity}</div> // Nội dung hoạt động
          {!!(item?.proofs || []).length && ( // Nếu có file chứng minh
            <div className="flex flex-wrap gap-2 mt-2"> // Hiển thị links file
              {(item?.proofs || []).map((proof, idx) => {
                const base = import.meta.env.VITE_APP_BASE_URL || ""; // Base URL
                const normalized = proof?.startsWith("http") // Chuẩn hóa URL
                  ? proof
                  : `${base}${proof?.startsWith("/") ? proof : `/${proof}`}`;
                return (
                  <a
                    key={proof + idx}
                    href={normalized}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 underline"
                  >
                    File {idx + 1} // Link file
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex gap-10 2xl:gap-20 min-h-screen px-10 py-8 bg-white shadow rounded-md justify-between overflow-y-auto"> // Container chính
      <div className="w-full md:w-1/2"> // Cột trái: danh sách hoạt động
        <h4 className="text-gray-600 font-semibold text-lg mb-2">Hoạt động</h4> // Tiêu đề
        <p className="text-sm text-gray-500 mb-3">
          Khu vực này dùng để ghi lại tiến độ gửi cho quản lý. // Mô tả
        </p>
        <div className="w-full space-y-0"> // Danh sách hoạt động
          {(activity || [])
            .filter((item) => item?.type !== "commented") // Lọc bỏ commented
            .map((item, index, arr) => (
              <Card
                key={item.id || `${item?._id}-${index}`}
                item={item}
                isConnected={index < arr.length - 1}
              />
            ))}
        </div>
      </div>

      <div className="w-full md:w-1/3"> // Cột phải: form thêm hoạt động
        <h4 className="text-gray-600 font-semibold text-lg mb-5">
          Thêm hoạt động // Tiêu đề form
        </h4>
        <div className="w-full flex flex-wrap gap-5"> // Form chọn loại và nhập nội dung
            {act_types.map((item) => ( // Render radio buttons cho loại hoạt động
              <label key={item.value} className="flex gap-2 items-center cursor-pointer"> // Label cho mỗi radio
                <input
                  type="radio"
                  name="activityType"
                  className="w-4 h-4"
                  checked={selected === item.value} // Kiểm tra selected
                  onChange={() => setSelected(item.value)} // Cập nhật selected
                />
                <span>{item.label}</span> // Nhãn loại
              </label>
            ))}
          <textarea // Textarea nhập nội dung
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Mô tả tiến độ để quản lý nắm được tình hình..."
            className="bg-white w-full mt-10 border border-gray-300 outline-none p-4 rounded-md focus:ring-2 ring-blue-500"
          ></textarea>
          <div className="w-full"> // Phần upload file
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Gửi file // Label cho input file
            </label>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={(e) => setFiles(Array.from(e.target.files || []))} // Cập nhật files
              className="w-full border border-gray-300 rounded-md p-2"
            />
            {files?.length > 0 && ( // Hiển thị số file nếu có
              <p className="text-xs text-gray-500 mt-1">
                {files.length} file được chọn
              </p>
            )}
          </div>
          {isLoading ? ( // Loading khi gửi
            <Loading />
          ) : (
            <Button // Nút gửi
              type="button"
              label="Gửi"
              onClick={handleSubmit}
              className="bg-blue-600 text-white rounded"
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Component TaskDetail: Trang chi tiết task chính
const TaskDetail = () => {
  const { id } = useParams(); // Lấy ID task từ URL
  const { user } = useSelector((state) => state.auth); // Lấy user từ Redux
  const { data, isLoading, refetch } = useGetSingleTaskQuery(id); // Query lấy task
  const [selected, setSelected] = useState(0); // State tab selected
  const task = data?.task || []; // Dữ liệu task
  const tabs = [...TABS, { title: "Trao đổi", icon: <MdOutlineMessage /> }]; // Thêm tab trao đổi
  const teamMembers = Array.isArray(task?.team) ? task.team : []; // Danh sách team
  const visibleTeam = teamMembers.filter((member) => { // Lọc bỏ director
    const role = (member?.role || "").toString().toLowerCase();
    return role !== "director";
  });

  if (isLoading) // Nếu đang loading
    return (
      <div className="py-10">
        <Loading />
      </div>
    );

  const percentageCompleted = 0; // Hiện tại không dùng subtasks

  return (
    <div className="w-full flex flex-col gap-3 mb-4 overflow-y-hidden"> // Container chính
      {/* task detail */}
      <h1 className="text-2xl text-gray-600 font-bold">{task?.title}</h1> // Tiêu đề task
      <Tabs tabs={tabs} setSelected={setSelected}> // Render tabs
        {selected === 0 ? ( // Tab chi tiết
          <>
            <div className="w-full flex flex-col md:flex-row gap-5 2xl:gap-8 bg-white shadow rounded-md px-8 py-8 overflow-y-auto"> // Container chi tiết
              <div className="w-full md:w-1/2 space-y-8"> // Cột trái
                <div className="flex items-center gap-5"> // Hiển thị priority và stage
                  <div
                    className={clsx(
                      "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full",
                      PRIOTITYSTYELS[task?.priority],
                      bgColor[task?.priority]
                    )}
                  >
                    <span className="text-lg">
                      {ICONS[task?.priority]} // Icon priority
                    </span>
                    <span className="uppercase">
                      {task?.priority} ưu tiên // Text priority
                    </span>
                  </div>

                  <div className={clsx("flex items-center gap-2")}> // Hiển thị stage
                    <TaskColor className={TASK_TYPE[task?.stage]} /> // Icon màu stage
                    <span className="text-black uppercase">
                      {STAGE_LABELS[task?.stage] || task?.stage} // Nhãn stage
                    </span>
                  </div>
                </div>

                <p className="text-gray-500">
                  Ngày tạo: {moment(task?.date).format("LL")} // Ngày tạo task
                </p>

                <div className="flex items-center gap-8 p-4 border-y border-gray-200"> // Thống kê tài nguyên
                  <div className="space-x-2">
                    <span className="font-semibold">Tài nguyên :</span>
                    <span>{task?.assets?.length}</span> // Số tài nguyên
                  </div>
                </div>

                <div className="space-y-4 py-6"> // Phần nhóm công việc
                  <p className="text-gray-500 font-semibold text-sm">
                    NHÓM CÔNG VIỆC // Tiêu đề
                  </p>
                  <div className="space-y-3"> // Danh sách thành viên
                    {visibleTeam.map((m, index) => ( // Map qua team
                      <div
                        key={index + m?._id}
                        className="flex gap-4 py-2 items-center border-t border-gray-200"
                      >
                        <div className="w-10 h-10 rounded-full text-white flex items-center justify-center text-sm -mr-1 bg-blue-600"> // Avatar
                          <span className="text-center">
                            {getInitials(m?.name)} // Khởi tạo tên
                          </span>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{m?.name}</p> // Tên
                          <span className="text-gray-500">{m?.title}</span> // Chức vụ
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 space-y-3"> // Cột phải
                {task?.description && ( // Nếu có mô tả
                  <div className="mb-10">
                    <p className="text-lg font-semibold">MÔ TẢ CÔNG VIỆC</p> // Tiêu đề
                    <div className="w-full">{task?.description}</div> // Nội dung mô tả
                  </div>
                )}

                {task?.assets?.length > 0 && ( // Nếu có tài nguyên
                  <div className="pb-10">
                    <p className="text-lg font-semibold">TÀI NGUYÊN</p> // Tiêu đề
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"> // Grid hình ảnh
                      {task?.assets?.map((el, index) => { // Map qua assets
                        const base = import.meta.env.VITE_APP_BASE_URL || ""; // Base URL
                        const src = el?.startsWith("http") // Chuẩn hóa src
                          ? el
                          : `${base}${el?.startsWith("/") ? el : `/${el}`}`;
                        return (
                          <a
                            key={index}
                            href={src}
                            target="_blank"
                            rel="noreferrer"
                            className="block"
                          >
                            <img
                              src={src}
                              alt={`asset-${index + 1}`}
                              className="w-full rounded h-auto md:h-44 2xl:h-52 cursor-pointer transition-all duration-700 md:hover:scale-125 hover:z-50 object-cover"
                              onError={(e) => { // Xử lý lỗi hình
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {task?.links?.length > 0 && ( // Nếu có links
                  <div className="">
                    <p className="text-lg font-semibold">LIÊN KẾT HỖ TRỢ</p> // Tiêu đề
                    <div className="w-full flex flex-col gap-4"> // Danh sách links
                      {task?.links?.map((el, index) => ( // Map qua links
                        <a
                          key={index}
                          href={el}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {el} // Link
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : selected === 1 ? ( // Tab hoạt động
          <>
            <Activities
              activity={task?.activities} // Truyền activities
              refetch={refetch} // Hàm refresh
              id={id} // ID task
            />
          </>
        ) : ( // Tab trao đổi
          <ConversationBoard
            thread={task?.activities} // Truyền thread
            id={id} // ID task
            refetch={refetch} // Hàm refresh
          />
        )}
      </Tabs>
    </div>
  );
};

// Component ConversationBoard: Bảng trao đổi cho task
const ConversationBoard = ({ thread, id, refetch }) => {
  const { user } = useSelector((state) => state.auth); // Lấy user
  const [message, setMessage] = useState(""); // State tin nhắn
  const [postActivity, { isLoading }] = usePostTaskActivityMutation(); // Hook gửi activity

  const conversation = (thread || []) // Lọc và sắp xếp trao đổi
    .filter((item) => item?.type === "commented")
    .sort(
      (a, b) =>
        new Date(a?.date || a?.createdAt || 0) -
        new Date(b?.date || b?.createdAt || 0)
    );

  const handleSend = async () => { // Hàm gửi tin nhắn
    const text = message.trim();
    if (!text) {
      toast.error("Vui lòng nhập nội dung trao đổi"); // Kiểm tra rỗng
      return;
    }

    try {
      const now = new Date().toISOString(); // Thời gian hiện tại

      await postActivity({ // Gửi activity
        data: { type: "commented", activity: text, date: now },
        id,
      }).unwrap();
      setMessage(""); // Reset message
      refetch(); // Refresh
    } catch (err) {
      toast.error(
        err?.data?.message || err?.message || "Không thêm được trao đổi" // Lỗi
      );
    }
  };

  const renderBubble = (msg) => { // Hàm render bubble tin nhắn
    const authorName = msg?.by?.name || "Không xác định"; // Tên tác giả
    const isOwner = // Kiểm tra là chủ sở hữu
      user?._id &&
      (msg?.by?._id ? user?._id === msg?.by?._id : user?._id === msg?.by);

    return (
      <div
        key={`${msg?._id}-${msg?.date || msg?.createdAt}`}
        className={clsx(
          "flex gap-3 w-full",
          isOwner ? "justify-end" : "justify-start" // Căn phải/trái
        )}
      >
        <div
          className={clsx(
            "flex items-start gap-3 max-w-[85%]",
            isOwner ? "flex-row-reverse text-right" : "" // Đảo ngược nếu owner
          )}
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm"> // Avatar
            <span className="text-center">{getInitials(authorName)}</span> // Khởi tạo tên
          </div>
          <div
            className={clsx(
              "rounded-lg px-4 py-3 shadow-sm border border-gray-200 bg-white",
              isOwner ? "bg-blue-50 border-blue-200" : "bg-gray-50" // Màu khác cho owner
            )}
          >
            <p className="text-sm font-semibold text-gray-800">{authorName}</p> // Tên
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {msg?.activity} // Nội dung
            </p>
            <span className="text-xs text-gray-400 block mt-1">
              {moment(msg?.date || msg?.createdAt).fromNow()} // Thời gian
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white shadow rounded-md px-6 py-6 flex flex-col gap-5 min-h-[70vh] overflow-hidden"> // Container
      <div className="flex flex-col gap-4 border border-gray-200 rounded-md p-4 bg-gray-50 max-h-[55vh] overflow-y-auto"> // Khu vực tin nhắn
        {conversation?.length ? ( // Nếu có tin nhắn
          conversation.map((msg) => renderBubble(msg)) // Render từng bubble
        ) : (
          <p className="text-gray-500 text-sm">
            Chưa có trao đổi nào cho công việc này. // Thông báo trống
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3"> // Khu vực nhập
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ghi lại trao đổi ở đây..."
          className="bg-white w-full border border-gray-300 outline-none p-3 rounded-md focus:ring-2 ring-blue-500"
        /> // Textarea nhập
        <Button
          type="button"
          label={isLoading ? "Đang gửi..." : "Gửi trao đổi"} // Nút gửi
          onClick={handleSend}
          className="bg-blue-600 text-white rounded md:w-48"
        />
      </div>
    </div>
  );
};

export default TaskDetail; // Xuất component
