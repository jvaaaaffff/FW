import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  hoverImage: { type: String },
  stock: { type: Number, default: 0 },
  color: { type: String },
  material: { type: String },
  isTrending: { type: Boolean, default: false },
}, { timestamps: true });

export const Product = mongoose.model("Product", productSchema);
