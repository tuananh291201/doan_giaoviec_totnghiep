import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BiImages } from "react-icons/bi";
import { toast } from "sonner";

import {
  useCreateTaskMutation,
  useUploadAssetsMutation,
  useUpdateTaskMutation,
} from "../../redux/slices/api/taskApiSlice";
import { dateFormatter } from "../../utils";
import Button from "../Button";
import Loading from "../Loading";
import ModalWrapper from "../ModalWrapper";
import SelectList from "../SelectList";
import Textbox from "../Textbox";
import UserList from "./UsersSelect";

const LISTS = ["todo", "in progress", "completed"];
const PRIORIRY = ["high", "medium", "normal", "low"];

// Mapping để hiển thị tiêu đề tiếng Việt
const STAGE_DISPLAY = {
  "todo": "VIỆC CẦN LÀM",
  "in progress": "ĐANG TIẾN HÀNH",
  "completed": "HOÀN THÀNH",
};

const PRIORITY_DISPLAY = {
  "high": "CAO",
  "medium": "TRUNG BÌNH",
  "normal": "BÌNH THƯỜNG",
  "low": "THẤP",
};

const AddTask = ({ open, setOpen, task }) => {
  const defaultValues = {
    title: task?.title || "",
    date: dateFormatter(task?.date || new Date()),
    team: [],
    stage: "",
    priority: "",
    assets: [],
    description: "",
    links: "",
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const [stage, setStage] = useState(task?.stage || "todo");
  const [team, setTeam] = useState(task?.team || []);
  const [priority, setPriority] = useState(
    task?.priority || "normal"
  );
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [uploadAssets] = useUploadAssetsMutation();
  const URLS = task?.assets ? [...task.assets] : [];

  const handleOnSubmit = async (data) => {
    let uploadedFileURLs = [];

    try {
      if (assets.length > 0) {
        setUploading(true);
        const formData = new FormData();
        Array.from(assets).forEach((file) => formData.append("assets", file));

        const resUpload = await uploadAssets(formData).unwrap();
        uploadedFileURLs = resUpload?.urls || [];
      }
    } catch (error) {
      console.error("Error uploading file:", error?.message || error);
      toast.error(error?.data?.message || "Tải tệp thất bại. Vui lòng thử lại.");
      setUploading(false);
      return;
    } finally {
      setUploading(false);
    }

    try {
      const newData = {
        ...data,
        assets: [...URLS, ...uploadedFileURLs],
        team,
        stage,
        priority,
      };
      console.log(data, newData);
      const res = task?._id
        ? await updateTask({ ...newData, _id: task._id }).unwrap()
        : await createTask(newData).unwrap();

      toast.success(res.message);

      setTimeout(() => {
        setOpen(false);
      }, 500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleSelect = (e) => {
    setAssets(e.target.files);
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)}>
          <Dialog.Title
            as='h2'
            className='text-base font-bold leading-6 text-gray-900 mb-4'
          >
            {task ? "CẬP NHẬT CÔNG VIỆC" : "THÊM CÔNG VIỆC"}
          </Dialog.Title>

          <div className='mt-2 flex flex-col gap-6'>
            <Textbox
              placeholder='Tiêu đề công việc'
              type='text'
              name='title'
              label='Tiêu đề công việc'
              className='w-full rounded'
              register={register("title", {
                required: "Tiêu đề là bắt buộc!",
              })}
              error={errors.title ? errors.title.message : ""}
            />
            <UserList setTeam={setTeam} team={team} />
            <div className='flex gap-4'>
              <SelectList
                label='Giai đoạn công việc'
                lists={Object.entries(STAGE_DISPLAY).map(([key, value]) => ({ id: key, label: value }))}
                selected={stage}
                setSelected={setStage}
              />
              <SelectList
                label='Mức độ ưu tiên'
                lists={Object.entries(PRIORITY_DISPLAY).map(([key, value]) => ({ id: key, label: value }))}
                selected={priority}
                setSelected={setPriority}
              />
            </div>
            <div className='flex gap-4'>
              <div className='w-full'>
                <Textbox
                  placeholder='Ngày'
                  type='date'
                  name='date'
                  label='Ngày công việc'
                  className='w-full rounded'
                  register={register("date", {
                    required: "Ngày là bắt buộc!",
                  })}
                  error={errors.date ? errors.date.message : ""}
                />
              </div>
              <div className='w-full flex items-center justify-center mt-4'>
                <label
                  className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4'
                  htmlFor='imgUpload'
                >
                  <input
                    type='file'
                    className='hidden'
                    id='imgUpload'
                    onChange={(e) => handleSelect(e)}
                    accept='.jpg, .png, .jpeg'
                    multiple={true}
                  />
                  <BiImages />
                  <span>Thêm tài nguyên</span>
                </label>
              </div>
            </div>

            <div className='w-full'>
              <p>Mô tả công việc</p>
              <textarea
                name='description'
                {...register("description")}
                className='w-full bg-transparent px-3 py-1.5 2xl:py-3 border border-gray-300
            dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700
            text-gray-900 dark:text-white outline-none text-base focus:ring-2
            ring-blue-300'
              ></textarea>
            </div>

            <div className='w-full'>
              <p>
                Thêm liên kết{" "}
                <span className='text- text-gray-600'>
                  cách nhau bằng dấu phẩy (,)
                </span>
              </p>
              <textarea
                name='links'
                {...register("links")}
                className='w-full bg-transparent px-3 py-1.5 2xl:py-3 border border-gray-300
            dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700
            text-gray-900 dark:text-white outline-none text-base focus:ring-2
            ring-blue-300'
              ></textarea>
            </div>
          </div>

          {isLoading || isUpdating || uploading ? (
            <div className='py-4'>
              <Loading />
            </div>
          ) : (
            <div className='bg-gray-50 mt-6 mb-4 sm:flex sm:flex-row-reverse gap-4'>
              <Button
                label='Gửi'
                type='submit'
                className='bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700  sm:w-auto'
              />

              <Button
                type='button'
                className='bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto'
                onClick={() => setOpen(false)}
                label='Hủy'
              />
            </div>
          )}
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddTask;
