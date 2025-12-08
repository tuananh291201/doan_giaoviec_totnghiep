import clsx from "clsx";
import moment from "moment";
import "moment/locale/vi";
import React, { useState } from "react";
import { FaBug, FaSpinner, FaTasks, FaThumbsUp, FaUser } from "react-icons/fa";
import { GrInProgress } from "react-icons/gr";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineDoneAll,
  MdOutlineMessage,
  MdTaskAlt,
} from "react-icons/md";
import { RxActivityLog } from "react-icons/rx";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Button, Loading, Tabs } from "../components";
import { TaskColor } from "../components/tasks";
import {
  useGetSingleTaskQuery,
  usePostTaskActivityMutation,
} from "../redux/slices/api/taskApiSlice";
import { PRIOTITYSTYELS, TASK_TYPE, getInitials, STAGE_LABELS } from "../utils";

// --- cấu hình tiếng Việt cho moment ---
moment.locale("vi");
moment.updateLocale("vi", {
  relativeTime: {
    future: "trong %s",
    past: "%s trước",
    s: "vài giây",
    ss: "%d giây",
    m: "1 phút",
    mm: "%d phút",
    h: "1 giờ",
    hh: "%d giờ",
    d: "1 ngày",
    dd: "%d ngày",
    M: "1 tháng",
    MM: "%d tháng",
    y: "1 năm",
    yy: "%d năm",
  },
});

moment.relativeTimeThreshold("s", 59);
moment.relativeTimeThreshold("ss", 59);
moment.relativeTimeRounding(Math.floor);
const formatRelativeTime = (value) => {
  const target = value ? moment(value) : null;
  if (!target || !target.isValid()) return "";
  const diffSeconds = moment().diff(target, "seconds");
  if (diffSeconds < 60) {
    const seconds = Math.max(diffSeconds, 1);
    return seconds <= 1 ? "v�i gi�y tru?c" : `${seconds} gi�y tru?c`;
  }
  return target.fromNow();
};

const assets = [
  "https://images.pexels.com/photos/2418664/pexels-photo-2418664.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/8797307/pexels-photo-8797307.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/2534523/pexels-photo-2534523.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/804049/pexels-photo-804049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
];

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const bgColor = {
  high: "bg-red-200",
  medium: "bg-yellow-200",
  low: "bg-blue-200",
};

const TABS = [
  { title: "Chi tiết công việc", icon: <FaTasks /> },
  { title: "Hoạt động/Dòng thời gian", icon: <RxActivityLog /> },
];

const TASKTYPEICON = {
  commented: (
    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
      <MdOutlineMessage />
    </div>
  ),
  started: (
    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
      <FaThumbsUp size={20} />
    </div>
  ),
  assigned: (
    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-500 text-white">
      <FaUser size={14} />
    </div>
  ),
  bug: (
    <div className="text-red-600">
      <FaBug size={24} />
    </div>
  ),
  completed: (
    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
      <MdOutlineDoneAll size={24} />
    </div>
  ),
  "in progress": (
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-600 text-white">
      <GrInProgress size={16} />
    </div>
  ),
};

const act_types = [
  { label: "Bắt đầu", value: "started" },
  { label: "Hoàn thành", value: "completed" },
  { label: "Đang tiến hành", value: "in progress" },
  { label: "Lỗi", value: "bug" },
  { label: "Gán việc", value: "assigned" },
];

const ACTIVITY_LABELS = {
  commented: "Trao đổi",
  started: "Bắt đầu",
  completed: "Hoàn thành",
  "in progress": "Đang tiến hành",
  bug: "Lỗi",
  assigned: "Gán việc",
};

const Activities = ({ activity, id, refetch }) => {
  const [selected, setSelected] = useState(act_types[0].value);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);

  const [postActivity, { isLoading }] = usePostTaskActivityMutation();

const handleSubmit = async () => {
    try {
      const now = new Date().toISOString(); // th?i ?i?m client g?i

      const formData = new FormData();
      formData.append("type", selected);
      formData.append("activity", text);
      formData.append("date", now); // g?i lu?n date
      (files || []).forEach((file) => formData.append("proofs", file));

      const res = await postActivity({
        data: formData,
        id,
      }).unwrap();
      setText("");
      setFiles([]);
      toast.success(res?.message);
      refetch();
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  }
  const Card = ({ item }) => {
    return (
      <div className={`flex space-x-4`}>
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-10 h-10 flex items-center justify-center">
            {TASKTYPEICON[item?.type]}
          </div>
          <div className="h-full flex items-center">
            <div className="w-0.5 bg-gray-300 h-full"></div>
          </div>
        </div>

        <div className="flex flex-col gap-y-1 mb-8">
          <p className="font-semibold">{item?.by?.name}</p>
          <div className="text-gray-500 space-x-2">
            <span className="capitalize">
              {ACTIVITY_LABELS[item?.type] || item?.type}
            </span>
            <span className="text-sm">
              {moment(item?.date || item?.createdAt).fromNow()}
            </span>
          </div>
          <div className="text-gray-700">{item?.activity}</div>
          {!!(item?.proofs || []).length && (
            <div className="flex flex-wrap gap-2 mt-2">
              {(item?.proofs || []).map((proof, idx) => {
                const base = import.meta.env.VITE_APP_BASE_URL || "";
                const normalized = proof?.startsWith("http")
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
                    File {idx + 1}
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
    <div className="w-full flex gap-10 2xl:gap-20 min-h-screen px-10 py-8 bg-white shadow rounded-md justify-between overflow-y-auto">
      <div className="w-full md:w-1/2">
        <h4 className="text-gray-600 font-semibold text-lg mb-2">Hoạt động</h4>
        <p className="text-sm text-gray-500 mb-3">
          Khu vực này dùng để ghi lại tiến độ gửi cho quản lý.
        </p>
        <div className="w-full space-y-0">
          {(activity || [])
            .filter((item) => item?.type !== "commented")
            .map((item, index, arr) => (
              <Card
                key={item.id || `${item?._id}-${index}`}
                item={item}
                isConnected={index < arr.length - 1}
              />
            ))}
        </div>
      </div>

      <div className="w-full md:w-1/3">
        <h4 className="text-gray-600 font-semibold text-lg mb-5">
          Thêm hoạt động
        </h4>
        <div className="w-full flex flex-wrap gap-5">
            {act_types.map((item) => (
              <label key={item.value} className="flex gap-2 items-center cursor-pointer">
                <input
                  type="radio"
                  name="activityType"
                  className="w-4 h-4"
                  checked={selected === item.value}
                  onChange={() => setSelected(item.value)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Mô tả tiến độ để quản lý nắm được tình hình..."
            className="bg-white w-full mt-10 border border-gray-300 outline-none p-4 rounded-md focus:ring-2 ring-blue-500"
          ></textarea>
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Gửi file
            </label>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="w-full border border-gray-300 rounded-md p-2"
            />
            {files?.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {files.length} file được chọn
              </p>
            )}
          </div>
          {isLoading ? (
            <Loading />
          ) : (
            <Button
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

const TaskDetail = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading, refetch } = useGetSingleTaskQuery(id);
  const [selected, setSelected] = useState(0);
  const task = data?.task || [];
  const tabs = [...TABS, { title: "Trao đổi", icon: <MdOutlineMessage /> }];
  const teamMembers = Array.isArray(task?.team) ? task.team : [];
  const visibleTeam = teamMembers.filter((member) => {
    const role = (member?.role || "").toString().toLowerCase();
    return role !== "director";
  });

  if (isLoading)
    return (
      <div className="py-10">
        <Loading />
      </div>
    );

  const percentageCompleted = 0; // hiện tại không dùng subtasks

  return (
    <div className="w-full flex flex-col gap-3 mb-4 overflow-y-hidden">
      {/* task detail */}
      <h1 className="text-2xl text-gray-600 font-bold">{task?.title}</h1>
      <Tabs tabs={tabs} setSelected={setSelected}>
        {selected === 0 ? (
          <>
            <div className="w-full flex flex-col md:flex-row gap-5 2xl:gap-8 bg-white shadow rounded-md px-8 py-8 overflow-y-auto">
              <div className="w-full md:w-1/2 space-y-8">
                <div className="flex items-center gap-5">
                  <div
                    className={clsx(
                      "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full",
                      PRIOTITYSTYELS[task?.priority],
                      bgColor[task?.priority]
                    )}
                  >
                    <span className="text-lg">
                      {ICONS[task?.priority]}
                    </span>
                    <span className="uppercase">
                      {task?.priority} ưu tiên
                    </span>
                  </div>

                  <div className={clsx("flex items-center gap-2")}>
                    <TaskColor className={TASK_TYPE[task?.stage]} />
                    <span className="text-black uppercase">
                      {STAGE_LABELS[task?.stage] || task?.stage}
                    </span>
                  </div>
                </div>

                <p className="text-gray-500">
                  Ngày tạo: {moment(task?.date).format("LL")}
                </p>

                <div className="flex items-center gap-8 p-4 border-y border-gray-200">
                  <div className="space-x-2">
                    <span className="font-semibold">Tài nguyên :</span>
                    <span>{task?.assets?.length}</span>
                  </div>
                </div>

                <div className="space-y-4 py-6">
                  <p className="text-gray-500 font-semibold text-sm">
                    NHÓM CÔNG VIỆC
                  </p>
                  <div className="space-y-3">
                    {visibleTeam.map((m, index) => (
                      <div
                        key={index + m?._id}
                        className="flex gap-4 py-2 items-center border-t border-gray-200"
                      >
                        <div className="w-10 h-10 rounded-full text-white flex items-center justify-center text-sm -mr-1 bg-blue-600">
                          <span className="text-center">
                            {getInitials(m?.name)}
                          </span>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{m?.name}</p>
                          <span className="text-gray-500">{m?.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 space-y-3">
                {task?.description && (
                  <div className="mb-10">
                    <p className="text-lg font-semibold">MÔ TẢ CÔNG VIỆC</p>
                    <div className="w-full">{task?.description}</div>
                  </div>
                )}

                {task?.assets?.length > 0 && (
                  <div className="pb-10">
                    <p className="text-lg font-semibold">TÀI NGUYÊN</p>
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                      {task?.assets?.map((el, index) => {
                        const base = import.meta.env.VITE_APP_BASE_URL || "";
                        const src = el?.startsWith("http")
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
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {task?.links?.length > 0 && (
                  <div className="">
                    <p className="text-lg font-semibold">LIÊN KẾT HỖ TRỢ</p>
                    <div className="w-full flex flex-col gap-4">
                      {task?.links?.map((el, index) => (
                        <a
                          key={index}
                          href={el}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {el}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : selected === 1 ? (
          <>
            <Activities
              activity={task?.activities}
              refetch={refetch}
              id={id}
            />
          </>
        ) : (
          <ConversationBoard
            thread={task?.activities}
            id={id}
            refetch={refetch}
          />
        )}
      </Tabs>
    </div>
  );
};

const ConversationBoard = ({ thread, id, refetch }) => {
  const { user } = useSelector((state) => state.auth);
  const [message, setMessage] = useState("");
  const [postActivity, { isLoading }] = usePostTaskActivityMutation();

  const conversation = (thread || [])
    .filter((item) => item?.type === "commented")
    .sort(
      (a, b) =>
        new Date(a?.date || a?.createdAt || 0) -
        new Date(b?.date || b?.createdAt || 0)
    );

  const handleSend = async () => {
    const text = message.trim();
    if (!text) {
      toast.error("Vui lòng nhập nội dung trao đổi");
      return;
    }

    try {
      const now = new Date().toISOString();

      await postActivity({
        data: { type: "commented", activity: text, date: now },
        id,
      }).unwrap();
      setMessage("");
      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message || err?.message || "Không thêm được trao đổi"
      );
    }
  };

  const renderBubble = (msg) => {
    const authorName = msg?.by?.name || "Không xác định";
    const isOwner =
      user?._id &&
      (msg?.by?._id ? user?._id === msg?.by?._id : user?._id === msg?.by);

    return (
      <div
        key={`${msg?._id}-${msg?.date || msg?.createdAt}`}
        className={clsx(
          "flex gap-3 w-full",
          isOwner ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={clsx(
            "flex items-start gap-3 max-w-[85%]",
            isOwner ? "flex-row-reverse text-right" : ""
          )}
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">
            <span className="text-center">{getInitials(authorName)}</span>
          </div>
          <div
            className={clsx(
              "rounded-lg px-4 py-3 shadow-sm border border-gray-200 bg-white",
              isOwner ? "bg-blue-50 border-blue-200" : "bg-gray-50"
            )}
          >
            <p className="text-sm font-semibold text-gray-800">{authorName}</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {msg?.activity}
            </p>
            <span className="text-xs text-gray-400 block mt-1">
              {moment(msg?.date || msg?.createdAt).fromNow()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white shadow rounded-md px-6 py-6 flex flex-col gap-5 min-h-[70vh] overflow-hidden">
      <div className="flex flex-col gap-4 border border-gray-200 rounded-md p-4 bg-gray-50 max-h-[55vh] overflow-y-auto">
        {conversation?.length ? (
          conversation.map((msg) => renderBubble(msg))
        ) : (
          <p className="text-gray-500 text-sm">
            Chưa có trao đổi nào cho công việc này.
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ghi lại trao đổi ở đây..."
          className="bg-white w-full border border-gray-300 outline-none p-3 rounded-md focus:ring-2 ring-blue-500"
        />
        <Button
          type="button"
          label={isLoading ? "Đang gửi..." : "Gửi trao đổi"}
          onClick={handleSend}
          className="bg-blue-600 text-white rounded md:w-48"
        />
      </div>
    </div>
  );
};

export default TaskDetail;
