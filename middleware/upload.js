import multer from "multer";
import sharp from "sharp";
import cloudinary from "../config/cloudinary.js";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const MIN_WIDTH = 1200;
const MIN_HEIGHT = 630;

const getTargetFolder = (req) => {
  if (req.baseUrl?.includes("authors")) return "authors";
  if (req.baseUrl?.includes("blog") || req.baseUrl?.includes("blogs")) return "blogs";
  return "uploads";
};

export const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const metadata = await sharp(req.file.buffer).metadata();
    if ((metadata.width || 0) < MIN_WIDTH || (metadata.height || 0) < MIN_HEIGHT) {
      return res.status(400).json({
        success: false,
        message: `Image dimensions must be at least ${MIN_WIDTH}x${MIN_HEIGHT}`,
      });
    }

    const optimizedBuffer = await sharp(req.file.buffer)
      .resize(1600, 900, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 78 })
      .toBuffer();

    const base64 = optimizedBuffer.toString("base64");

    const uploadResult = await cloudinary.uploader.upload(`data:image/webp;base64,${base64}`, {
      folder: getTargetFolder(req),
      resource_type: "image",
      format: "webp",
    });

    const optimizedUrl = cloudinary.url(uploadResult.public_id, {
      secure: true,
      fetch_format: "auto",
      quality: "auto",
      width: 1600,
      crop: "limit",
    });

    req.file.path = optimizedUrl;
    req.file.public_id = uploadResult.public_id;
    req.file.optimized_url = optimizedUrl;

    next();
  } catch (error) {
    next(error);
  }
};

export default upload;
