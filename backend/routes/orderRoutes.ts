import express from "express";
import { orderController } from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route for guest checkout, or you can protect it
router.post("/", authMiddleware.verifyToken, orderController.createOrder);
router.get("/", authMiddleware.verifyToken, orderController.getOrders);
router.get("/:id", authMiddleware.verifyToken, orderController.getOrderById);
router.put("/:id/cancel", authMiddleware.verifyToken, orderController.cancelOrder);

export default router;
