import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import blogRoutes from "./routes/blogRoutes.js";
import authorRoutes from "./routes/authorRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { verifyCloudinaryConnection } from "./config/cloudinary.js";
import aiRoutesss from "./routes/ai.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use("/api/blog", blogRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", testRoutes);
app.use("/api/ai", aiRoutesss);

// Backward compatibility
app.use("/blogs", blogRoutes);
app.use("/authors", authorRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await verifyCloudinaryConnection();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
