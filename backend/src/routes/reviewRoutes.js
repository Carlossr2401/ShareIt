import express from "express";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { createReview } from "../controllers/reviewController.js";
import { uploadImages } from "../controllers/resourceController.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", uploadImages, createReview);

export default router;
