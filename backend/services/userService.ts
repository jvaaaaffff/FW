import { User } from "../models/User.js";

export const userService = {
  async getAllUsers() {
    return await User.find().select("-password");
  },

  async createUser(userData: any) {
    const user = new User(userData);
    return await user.save();
  },

  async getUserById(id: string) {
    return await User.findById(id).select("-password");
  },

  async updateUser(id: string, updateData: any) {
    const user = await User.findById(id);
    if (!user) return null;
    Object.assign(user, updateData);
    await user.save();
    const updatedUser = user.toObject();
    delete (updatedUser as any).password;
    return updatedUser;
  },

  async deleteUser(id: string) {
    return await User.findByIdAndDelete(id);
  }
};
