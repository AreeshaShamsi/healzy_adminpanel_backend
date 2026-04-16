import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB  is connected");
  } catch (error) {
    console.error("DB error:", error.message);
    process.exit(1); // stop app if DB fails
  }
};

export default connectDB;