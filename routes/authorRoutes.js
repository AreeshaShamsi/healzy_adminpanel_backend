import express from "express";
import {
  createAuthor,
  getAuthors,
  getAuthorWithBlogs,
  updateAuthor,
  deleteAuthor
} from "../controllers/authorController.js";

import upload, { uploadToCloudinary } from "../middleware/upload.js";

const router = express.Router();

// ✅ CREATE
router.post(
  "/",
  upload.single("photo"),
  uploadToCloudinary,
  createAuthor
);

// ✅ GET ALL
router.get("/", getAuthors);

// ✅ GET SINGLE
router.get("/:id", getAuthorWithBlogs);

// ✅ UPDATE
router.put(
  "/:id",
  upload.single("photo"),
  uploadToCloudinary,
  updateAuthor
);

// ✅ DELETE
router.delete("/:id", deleteAuthor);

export default router;