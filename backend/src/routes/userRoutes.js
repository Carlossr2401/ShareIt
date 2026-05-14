import express from "express";
import {
  getUsers,
  getUserById,
  addPenalty,
  removePenalty,
} from "../controllers/userController.js";
import { requireAuth, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply auth and admin middleware to all user routes
router.use(requireAuth, isAdmin);

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/:id/penalties", addPenalty);
router.delete("/:id/penalties/:penaltyId", removePenalty);

export default router;
