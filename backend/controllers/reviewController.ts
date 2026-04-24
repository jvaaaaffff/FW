import { Request, Response, NextFunction } from "express";

export const reviewController = {
  async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      // Mock returning empty reviews for now
      res.status(200).json({
        success: true,
        data: []
      });
    } catch (error) {
      next(error);
    }
  },

  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const { rating, comment } = req.body;
      
      const reviewId = "REV-" + Math.random().toString(36).substring(2, 9).toUpperCase();
      
      res.status(201).json({
        success: true,
        data: {
          id: reviewId,
          productId,
          rating,
          comment,
          userId: (req as any).user._id,
          userName: (req as any).user.name,
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }
};
