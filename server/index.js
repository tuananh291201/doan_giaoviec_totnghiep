import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler, routeNotFound } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";
import dbConnection from "./utils/connectDB.js";

dotenv.config();
dbConnection();

const port = process.env.PORT || 5000;

const app = express();

app.use(
  cors({
    origin: [
      "https://mern-task-manager-app.netlify.app",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
// app.use(morgan("dev"));

// static serve uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

// Đảm bảo thư mục uploads tồn tại (tránh ENOENT khi Multer ghi file)
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", routes);

app.use(routeNotFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server listening on ${port}`));
