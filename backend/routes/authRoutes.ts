import express from "express";
import { registerUser, loginUser, loginWithOtp, getMe, sendOtp, verifyOtp, googleAuth, facebookAuth, validateRegister, validateLogin } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/login-otp", loginWithOtp);
router.post("/google", googleAuth);
router.post("/facebook", facebookAuth);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/me", protect, getMe);

export default router;
