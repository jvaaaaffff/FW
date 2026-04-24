import express from "express";
import { reviewController } from "../controllers/reviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.get("/", reviewController.getReviews);
router.post("/", authMiddleware.verifyToken, reviewController.createReview);

export default router;
