import express from "express";
import { userController } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/", userController.createUser);

// Protected routes
router.get("/", authMiddleware.verifyToken, userController.getUsers);
router.put("/profile", authMiddleware.verifyToken, userController.updateProfile);
router.delete("/profile", authMiddleware.verifyToken, userController.deleteProfile);
router.get("/:id", authMiddleware.verifyToken, userController.getUser);

export default router;
