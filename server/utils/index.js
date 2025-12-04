import jwt from "jsonwebtoken";

const createJWT = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,                 // dev: false, prod: true
    sameSite: isProduction ? "none" : "lax", // dev: 'lax' để không bị chặn
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });
};

export default createJWT;
