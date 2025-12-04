import { Dialog } from "@headlessui/react";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useRegisterMutation } from "../redux/slices/api/authApiSlice";
import { useUpdateUserMutation } from "../redux/slices/api/userApiSlice";
import { setCredentials } from "../redux/slices/authSlice";
import { Button, Loading, ModalWrapper, Textbox } from "./";

const AddUser = ({ open, setOpen, userData }) => {
  let defaultValues = userData ?? {};
  const { user } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const dispatch = useDispatch();

  const [addNewUser, { isLoading }] = useRegisterMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const handleOnSubmit = async (data) => {
    try {
      if (userData) {
        const res = await updateUser(data).unwrap();
        toast.success(res?.message);
        if (userData?._id === user?._id) {
          dispatch(setCredentials({ ...res?.user }));
        }
      } else {
        const res = await addNewUser({
          ...data,
          password: "123",
        }).unwrap();
        toast.success("Người dùng mới đã thêm thành công");
      }

      setTimeout(() => {
        setOpen(false);
      }, 1500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className=''>
          <Dialog.Title
            as='h2'
            className='text-base font-bold leading-6 text-gray-900 mb-4'
          >
            {userData ? "CẬP NHẬT HỒ SƠ" : "THÊM NGƯỜI DÙNG MỚI"}
          </Dialog.Title>
          <div className='mt-2 flex flex-col gap-6'>
            <Textbox
              placeholder='Họ và tên'
              type='text'
              name='name'
              label='Họ và tên'
              className='w-full rounded'
              register={register("name", {
                required: "Họ và tên!",
              })}
              error={errors.name ? errors.name.message : ""}
            />

            <div className='flex flex-col gap-1'>
              <label className='text-sm font-medium text-gray-700'>Chức danh</label>
              <select
                className='w-full rounded border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring'
                defaultValue={defaultValues.title || ""}
                {...register("title", {
                  required: "Chức danh là bắt buộc!",
                })}
              >
                <option value='' disabled>
                  -- Chọn chức danh --
                </option>
                <option value='Manager'>Manager</option>
                <option value='Staff'>Staff</option>
                <option value='Director'>Director</option>
              </select>
              {errors.title && (
                <span className='text-xs text-red-500'>{errors.title.message}</span>
              )}
            </div>

            <Textbox
              placeholder='Địa chỉ email'
              type='email'
              name='email'
              label='Địa chỉ email'
              className='w-full rounded'
              register={register("email", {
                required: "Địa chỉ email là bắt buộc!",
              })}
              error={errors.email ? errors.email.message : ""}
            />

            <div className='flex flex-col gap-1'>
              <label className='text-sm font-medium text-gray-700'>Vai trò</label>
              <select
                className='w-full rounded border px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring'
                defaultValue={defaultValues.role || ""}
                {...register("role", {
                  required: "Vai trò người dùng là bắt buộc!",
                })}
              >
                <option value='' disabled>
                  -- Chọn vai trò --
                </option>
                <option value='admin'>admin</option>
                <option value='employee'>employee</option>
                <option value='director'>director</option>
              </select>
              {errors.role && (
                <span className='text-xs text-red-500'>{errors.role.message}</span>
              )}
            </div>
          </div>

          {isLoading || isUpdating ? (
            <div className='py-5'>
              <Loading />
            </div>
          ) : (
            <div className='py-3 mt-4 sm:flex sm:flex-row-reverse'>
              <Button
                type='submit'
                className='bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700  sm:w-auto'
                label='Gui'
              />

              <Button
                type='button'
                className='bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto'
                onClick={() => setOpen(false)}
                label='Huy'
              />
            </div>
          )}
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddUser;
