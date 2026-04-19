import express from "express";

import {
  generateBrief,
  generateBody,
  generateSEO,
  generateAEO,
  generateAIO,
  generateSchema,
  regenerateField
//   generateAll
} from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/generate-brief", generateBrief);
router.post("/generate-body", generateBody);
router.post("/generate-seo", generateSEO);
router.post("/generate-aeo", generateAEO);
router.post("/generate-aio", generateAIO);
router.post("/generate-schema", generateSchema);
// router.post("/generate-all", generateAll);
router.post("/regenerate-field", regenerateField);


export default router;