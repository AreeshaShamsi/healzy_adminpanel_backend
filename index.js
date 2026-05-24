import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import blogRoutes from "./routes/blogRoutes.js";
import authorRoutes from "./routes/authorRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { verifyCloudinaryConnection } from "./config/cloudinary.js";
import { getActiveApiUrl, getApiUrls } from "./config/apiUrls.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use("/api/blog", blogRoutes);
app.use("/api/authors", authorRoutes);

// Backward compatibility
app.use("/blogs", blogRoutes);
app.use("/authors", authorRoutes);

app.get("/", (req, res) => {
  const urls = getApiUrls();
  const base = getActiveApiUrl();

  res.json({
    message: "API running",
    urls: {
      local: urls.local,
      production: urls.production,
      active: urls.active,
      env: urls.env,
    },
    routes: {
      authors: `${base}/api/authors`,
      blog: `${base}/api/blog`,
      health: `${base}/`,
    },
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const isVercel = process.env.VERCEL === "1";

const startServer = async () => {
  try {
    await connectDB();
    if (!isVercel) {
      await verifyCloudinaryConnection();
    }

    if (!isVercel) {
      const urls = getApiUrls();
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running (${urls.env}): ${urls.active}`);
        console.log(`  Local:      ${urls.local}`);
        console.log(`  Production: ${urls.production}`);
      });
    }
  } catch (error) {
    console.error("Server failed to start:", error.message);
    if (!isVercel) {
      process.exit(1);
    }
    throw error;
  }
};

startServer();

export default app;
