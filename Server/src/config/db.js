import mongoose from "mongoose";

// import dotenv from "dotenv";
// dotenv.config();
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("🔌 Connected to database successfully!");
  } catch (error) {
    console.log(error.message);
  }
};
export default connectDB;
