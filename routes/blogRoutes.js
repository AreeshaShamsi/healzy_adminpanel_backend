import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  autosaveBlog,
  getSeoScore,
} from "../controllers/blogController.js";
import upload, { uploadToCloudinary } from "../middleware/upload.js";
import blockLowScorePublish from "../middleware/blog/publishGuard.js";

const router = express.Router();

router.post("/", upload.single("cover_image"), uploadToCloudinary, createBlog);
router.get("/", getAllBlogs);
router.get("/:id/seo-score", getSeoScore);
router.put("/:id/autosave", autosaveBlog);
router.put("/:id", upload.single("cover_image"), uploadToCloudinary, blockLowScorePublish, updateBlog);
router.delete("/:id", deleteBlog);
router.get("/slug/:slug", getBlogBySlug);

export default router;
