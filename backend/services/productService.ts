import { Product } from "../models/Product.js";
import { seedProducts } from "../data/products.js";

const parseArrayParam = (param: any) => {
  if (!param) return [];
  if (Array.isArray(param)) return param.map((item) => String(item).trim()).filter(Boolean);
  return String(param).split(",").map((item) => item.trim()).filter(Boolean);
};

export const productService = {
  async getAllProducts(query: any = {}) {
    const filters: any = {};

    if (query.category) {
      const categories = parseArrayParam(query.category);
      filters.category = categories.length === 1 ? categories[0] : { $in: categories };
    }

    if (query.color) {
      const colors = parseArrayParam(query.color);
      filters.color = colors.length === 1 ? colors[0] : { $in: colors };
    }

    if (query.material) {
      const materials = parseArrayParam(query.material);
      filters.material = materials.length === 1 ? materials[0] : { $in: materials };
    }

    if (query.search) {
      const search = String(query.search).trim();
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (query.minPrice || query.maxPrice) {
      filters.price = {};
      if (query.minPrice) filters.price.$gte = Number(query.minPrice);
      if (query.maxPrice) filters.price.$lte = Number(query.maxPrice);
    }

    if (query.isTrending) {
      filters.isTrending = String(query.isTrending).toLowerCase() === "true";
    }

    const sort = String(query.sort || "").toLowerCase();
    let queryBuilder = Product.find(filters);

    if (sort === "price-asc") queryBuilder = queryBuilder.sort({ price: 1 });
    if (sort === "price-desc") queryBuilder = queryBuilder.sort({ price: -1 });
    if (sort === "name-asc") queryBuilder = queryBuilder.sort({ name: 1 });
    if (sort === "name-desc") queryBuilder = queryBuilder.sort({ name: -1 });

    return await queryBuilder.exec();
  },

  async getProductById(id: string) {
    return await Product.findOne({ id });
  },

  async createProduct(productData: any) {
    const product = new Product(productData);
    return await product.save();
  },

  async updateProduct(id: string, productData: any) {
    return await Product.findOneAndUpdate({ id }, productData, { new: true });
  },

  async deleteProduct(id: string) {
    return await Product.findOneAndDelete({ id });
  },

  async getCategories() {
    return await Product.distinct("category");
  },

  async getTrendingProducts() {
    return await Product.find({ isTrending: true }).limit(8).exec();
  },

  async seedProducts() {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(seedProducts);
    }
  },
};
