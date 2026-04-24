import { Request, Response, NextFunction } from "express";
import { promotionService } from "../services/promotionService.js";

export const promotionController = {
  async getPromotions(req: Request, res: Response, next: NextFunction) {
    try {
      const promotions = promotionService.getLandingPromotions();
      const discountCodes = promotionService.getActiveDiscountCodes();
      res.status(200).json({ success: true, data: { promotions, discountCodes } });
    } catch (error) {
      next(error);
    }
  },

  async applyDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, cart, total } = req.body;
      if (!code) {
        res.status(400);
        throw new Error("Discount code is required.");
      }
      if (!Array.isArray(cart)) {
        res.status(400);
        throw new Error("Cart items are required to apply a discount.");
      }
      const discountResult = promotionService.applyDiscount(code, cart, Number(total || 0));
      res.status(200).json({ success: true, data: discountResult });
    } catch (error) {
      next(error);
    }
  },
};
