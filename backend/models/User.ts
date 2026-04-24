import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String },
  age: { type: Number },
  gender: { type: String },
  avatarUrl: { type: String },
  facebookUrl: { type: String },
  facebookId: { type: String },
  googleId: { type: String },
  isPhoneVerified: { type: Boolean, default: false },
  role: { type: String, default: "user" },
  wishlist: [{ type: String }],
  cart: [{ type: String }],
  authProvider: { type: String, default: 'local' }, // 'local', 'google', 'facebook'
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);
