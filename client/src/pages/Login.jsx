import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Loading, Textbox } from "../components";
import { useLoginMutation } from "../redux/slices/api/authApiSlice";
import { setCredentials } from "../redux/slices/authSlice";

const Login = () => {
  const { user } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (data) => {
  try {
    const res = await login(data).unwrap();
    dispatch(setCredentials(res));

    if (res.role === "director") {
      navigate("/reports");     // trang dành riêng cho giám đốc
    } else {
      navigate("/dashboard");   // nhân viên / quản lý
    }
  } catch (err) {
    toast.error(err?.data?.message || err.error);
  }
};

useEffect(() => {
  if (!user) return;

  if (user.role === "director") {
    navigate("/reports");
  } else {
    navigate("/dashboard");
  }
}, [user, navigate]);

  return (
    // NỀN TOÀN TRANG -> HỒNG TÍM NHƯ BÊN TRÁI
    <div className="w-full min-h-screen flex bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 px-4 py-10">

      {/* BÊN TRÁI - TEXT */}
      <div className="hidden md:flex w-1/2 items-center px-12">
        <div>
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg mb-4">
            Hệ thống giao nhận công việc
          </h1>
        </div>
      </div>

      {/* BÊN PHẢI - FORM TRẮNG GỌN ĐẸP */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl px-8 py-10 border border-white/70">

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Đăng nhập
          </h2>

          <form onSubmit={handleSubmit(handleLogin)} className="flex flex-col gap-6">

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Địa chỉ email
              </label>
              <Textbox
                placeholder="you@example.com"
                type="email"
                name="email"
                className="w-full rounded-lg mt-1"
                register={register("email", { required: "Email là bắt buộc!" })}
                error={errors.email ? errors.email.message : ""}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <Textbox
                placeholder="••••••••"
                type="password"
                name="password"
                className="w-full rounded-lg mt-1"
                register={register("password", { required: "Mật khẩu là bắt buộc!" })}
                error={errors.password ? errors.password.message : ""}
              />
            </div>

            {/* BUTTON */}
            {isLoading ? (
              <Loading />
            ) : (
              <Button
                type="submit"
                label="Đăng nhập"
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all shadow-md"
              />
            )}
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
