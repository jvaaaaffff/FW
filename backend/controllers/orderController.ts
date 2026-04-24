import { Request, Response, NextFunction } from "express";
import { Order } from "../models/Order.js";

export const orderController = {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { items, total, shippingAddress } = req.body;
      const userId = (req as any).user?.id; // From auth middleware

      if (!Array.isArray(items) || items.length === 0) {
        res.status(400);
        throw new Error("Your cart is empty. Please add items before checking out.");
      }

      if (typeof total !== 'number' || total <= 0) {
        res.status(400);
        throw new Error("Order total is invalid. Please verify your cart and try again.");
      }

      if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.address) {
        res.status(400);
        throw new Error("Shipping address is required.");
      }

      // Simulated payment validation step. Replace with a real payment gateway in production.
      const paymentSuccess = true;
      if (!paymentSuccess) {
        res.status(402);
        throw new Error("Payment could not be processed. Please verify your payment details and try again.");
      }

      const orderId = "ORD-" + Math.random().toString(36).substring(2, 9).toUpperCase();

      // Create order in database
      const order = new Order({
        id: orderId,
        userId,
        items,
        total,
        status: 'pending',
        paymentStatus: 'paid', // Since payment was successful
        shippingAddress
      });

      await order.save();

      res.status(201).json({
        success: true,
        data: {
          id: orderId,
          items,
          total,
          shippingAddress,
          status: 'pending',
          paymentStatus: 'paid',
          createdAt: order.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401);
        throw new Error("Authentication required");
      }

      const orders = await Order.find({ userId }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  },

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401);
        throw new Error("Authentication required");
      }

      const order = await Order.findOne({ id, userId });

      if (!order) {
        res.status(404);
        throw new Error("Order not found");
      }

      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  },

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401);
        throw new Error("Authentication required");
      }

      const order = await Order.findOne({ id, userId });

      if (!order) {
        res.status(404);
        throw new Error("Order not found");
      }

      if (order.status === 'shipped' || order.status === 'delivered') {
        res.status(400);
        throw new Error("Cannot cancel order that has been shipped or delivered");
      }

      order.status = 'cancelled';
      order.paymentStatus = 'refunded';
      await order.save();

      res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        data: order
      });
    } catch (error) {
      next(error);
    }
  }
};
