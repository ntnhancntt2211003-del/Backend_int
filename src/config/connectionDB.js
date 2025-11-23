import mongoose from "mongoose";

// Fix strictQuery deprecation warning
mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.URL_DB || "");
    console.log("Kết nối MongoDB thành công");
  } catch (error) {
    console.error("Lỗi kết nối MongoDB:", error);
    process.exit(1);
  }
};

const getDb = () => {
  return mongoose.connection.db;
};

export { connectDB, getDb };
