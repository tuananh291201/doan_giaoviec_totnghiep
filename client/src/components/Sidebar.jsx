import clsx from "clsx";
import React from "react";
import { FaTasks, FaTrashAlt, FaUsers } from "react-icons/fa";
import {
  MdDashboard,
  MdOutlineAddTask,
  MdOutlinePendingActions,
  MdSettings,
  MdTaskAlt,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { setOpenSidebar } from "../redux/slices/authSlice";
import { IoCheckmarkDoneOutline } from "react-icons/io5";

const linkData = [
  {
    label: "Bảng điều khiển",
    link: "dashboard",
    icon: <MdDashboard />,
  },
  {
    label: "Công việc",
    link: "tasks",
    icon: <FaTasks />,
  },
  {
    label: "Hoàn thành",
    link: "completed/completed",
    icon: <MdTaskAlt />,
  },
  {
    label: "Đang tiến hành",
    link: "in-progress/in progress",
    icon: <MdOutlinePendingActions />,
  },
  {
    label: "Việc cần làm",
    link: "todo/todo",
    icon: <MdOutlinePendingActions />,
  },
  {
    label: "Thành viên",
    link: "team",
    icon: <FaUsers />,
  },
  {
    label: "Trạng thái",
    link: "status",
    icon: <IoCheckmarkDoneOutline />,
  },
  {
    label: "Thùng rác",
    link: "trashed",
    icon: <FaTrashAlt />,
  },
];

// Menu GIÁM ĐỐC
const directorLinks = [
  {
    label: "Bảng điều khiển",
    link: "dashboard",
    icon: <MdDashboard />,
  },
  {
    label: "Báo cáo",
    link: "reports", // /reports
    icon: <MdTaskAlt />,
  },
];

// Menu QUẢN LÝ (isAdmin = true)
const managerLinks = [
  ...linkData,
  {
    label: "Gửi báo cáo",
    link: "send-report", // /send-report
    icon: <MdOutlineAddTask />,
  },
];

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const location = useLocation();
  const path = location.pathname.split("/")[1];

  let sidebarLinks = [];

  if (!user) {
    sidebarLinks = [];
  } else if (user.role === "director") {
    sidebarLinks = directorLinks;
  } else if (user.isAdmin) {
    sidebarLinks = managerLinks;
  } else {
    sidebarLinks = linkData.slice(0, 5);
  }

  const closeSidebar = () => {
    dispatch(setOpenSidebar(false));
  };

  const NavLink = ({ el }) => {
    return (
      <Link
        onClick={closeSidebar}
        to={el.link}
        className={clsx(
          "w-fult lg:w-3/4 flex gap-2 px-3 py-2 rounded-full items-center text-gray-800 dark:text-gray-400 text-base hover:bg-[#2564ed2d]",
          path === el.link.split("/")[0] ? "bg-blue-700 text-white" : ""
        )}
      >
        {el.icon}
        <span className='hover:text-[#2564ed]'>{el.label}</span>
      </Link>
    );
  };

  return (
    <div className='w-full h-full flex flex-col gap-6 p-5'>
      <h1 className='flex gap-1 items-center'>
        <p className='bg-blue-600 p-2 rounded-full'>
          <MdOutlineAddTask className='text-white text-2xl font-black' />
        </p>
        <span className='text-2xl font-bold text-black dark:text-white'>
          GiaoViệc
        </span>
      </h1>

      <div className='flex-1 flex flex-col gap-y-5 py-8'>
        {sidebarLinks.map((link) => (
          <NavLink el={link} key={link.label} />
        ))}
      </div>

      <div>
        <button className='w-full flex gap-2 p-2 items-center text-lg text-gray-800 dark:text-white'>
          <MdSettings />
          <span>Cài đặt</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
