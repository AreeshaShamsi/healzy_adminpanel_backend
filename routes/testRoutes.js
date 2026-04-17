import express from "express";
import { generateAll } from "../controllers/testController.js";

const router = express.Router();

router.post("/generate", generateAll);

export default router;