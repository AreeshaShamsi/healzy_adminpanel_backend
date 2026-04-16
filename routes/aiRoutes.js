import express from "express";
import { generateAll, regenerateField } from "../controllers/ai/aiController.js";

const router = express.Router();

router.post("/generate-all", generateAll);
router.post("/regenerate-field", regenerateField);

export default router;
