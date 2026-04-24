import express from "express";
import { productController } from "../controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import reviewRoutes from "./reviewRoutes.js";
import { cache } from "../middleware/cacheMiddleware.js";

const router = express.Router();

router.use("/:productId/reviews", reviewRoutes);

// Public routes with caching
router.get("/", cache(300), productController.getProducts); // Cache for 5 minutes
router.get("/categories", cache(3600), productController.getCategories); // Cache for 1 hour
router.get("/trending", cache(600), productController.getTrendingProducts); // Cache for 10 minutes
router.get("/:id", cache(1800), productController.getProduct); // Cache for 30 minutes

// Protected routes (e.g., admin only in a real app) - no caching
router.post("/", authMiddleware.verifyToken, productController.createProduct);
router.put("/:id", authMiddleware.verifyToken, productController.updateProduct);
router.delete("/:id", authMiddleware.verifyToken, productController.deleteProduct);

export default router;
