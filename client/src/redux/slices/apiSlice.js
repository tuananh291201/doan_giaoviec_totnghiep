import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Lấy base URL từ .env Vite
const API_URL = import.meta.env.VITE_APP_BASE_URL + "/api";

console.log("API_URL from env =", API_URL); // 👈 thêm dòng này để debug

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include", // thường project task manager dùng cookie, thêm cho chắc
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: [],
  endpoints: (builder) => ({}),
});
