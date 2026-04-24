import { landingPromotions, discountCodes, DiscountCode } from "../data/promotions.js";

export const promotionService = {
  getLandingPromotions() {
    return landingPromotions.filter((promo) => promo.active);
  },

  getActiveDiscountCodes() {
    return discountCodes.filter((code) => code.active).map((code) => ({
      code: code.code,
      title: code.title,
      description: code.description,
      type: code.type,
      percentage: code.percentage,
      amount: code.amount,
      minSpend: code.minSpend,
      buyCount: code.buyCount,
      getFreeCount: code.getFreeCount,
      shippingDiscount: code.shippingDiscount,
      autoApply: code.autoApply,
      active: code.active,
    }));
  },

  findDiscountCode(code: string) {
    return discountCodes.find((discount) => discount.code.toUpperCase() === code.toUpperCase());
  },

  applyDiscount(code: string, cartItems: Array<{ price: number; quantity: number; }>, cartTotal: number) {
    const discount = this.findDiscountCode(code);
    if (!discount || !discount.active) {
      throw new Error("Invalid discount code");
    }

    let amount = 0;
    let shippingDiscount = false;

    switch (discount.type) {
      case "percentage":
        if (discount.minSpend && cartTotal < discount.minSpend) {
          throw new Error(`Spend at least ₹${discount.minSpend} to use ${discount.code}.`);
        }
        amount = Math.floor((cartTotal * (discount.percentage ?? 0)) / 100);
        break;
      case "fixed":
        if (discount.minSpend && cartTotal < discount.minSpend) {
          throw new Error(`Spend at least ₹${discount.minSpend} to use ${discount.code}.`);
        }
        amount = discount.amount ?? 0;
        break;
      case "bogo": {
        const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const buyCount = discount.buyCount ?? 0;
        const freeCount = discount.getFreeCount ?? 0;
        const groupSize = buyCount + freeCount;

        if (totalQuantity < groupSize) {
          throw new Error(`Add at least ${groupSize} items to your cart to use ${discount.code}.`);
        }

        const expandedPrices = cartItems.flatMap((item) => Array(item.quantity).fill(item.price));
        const eligibleFreeCount = Math.floor(totalQuantity / groupSize) * freeCount;
        const sortedPrices = expandedPrices.sort((a, b) => a - b);
        amount = sortedPrices.slice(0, eligibleFreeCount).reduce((sum, price) => sum + price, 0);
        break;
      }
      case "shipping":
        if (discount.minSpend && cartTotal < discount.minSpend) {
          throw new Error(`Spend at least ₹${discount.minSpend} to get free shipping.`);
        }
        shippingDiscount = true;
        break;
      default:
        throw new Error("Unsupported discount type");
    }

    return {
      code: discount.code,
      title: discount.title,
      description: discount.description,
      amount,
      shippingDiscount,
      type: discount.type,
    };
  },
};
