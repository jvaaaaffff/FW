import express from "express";
import { promotionController } from "../controllers/promotionController.js";

const router = express.Router();

router.get("/", promotionController.getPromotions);
router.post("/apply", promotionController.applyDiscount);

export default router;
