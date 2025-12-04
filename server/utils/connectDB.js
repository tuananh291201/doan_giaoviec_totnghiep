import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected");
  } catch (error) {
    console.error("DB Error:", error);
  }
};

export default dbConnection;
