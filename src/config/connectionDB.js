import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.URL_DB || "");
    console.log("Kết nối MongoDB thành công");
  } catch (error) {
    console.error("Lỗi kết nối MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
