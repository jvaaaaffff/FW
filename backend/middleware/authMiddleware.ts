import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as any;
      (req as any).user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401);
      next(new Error("Not authorized, token failed"));
    }
  } else {
    res.status(401);
    next(new Error("Not authorized, no token"));
  }
};

export const authMiddleware = {
  verifyToken: protect
};
