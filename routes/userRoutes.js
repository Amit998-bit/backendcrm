const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
  try {
    console.log("Incoming Request Data:", req.body);

    const { name, email, password, role, parent } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure parent is an array of valid ObjectIds
    const parentIds = Array.isArray(parent) 
      ? parent.filter(id => mongoose.Types.ObjectId.isValid(id)) 
      : [];

    console.log("Validated Parent IDs:", parentIds);

    const newUser = new User({ name, email, password, role, parent: parentIds });
    await newUser.save();

    res.json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(400).json({ message: "Error creating user", error: error.message });
  }
});

// ✅ Get All Users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().populate("parent", "name email role");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

// ✅ Get a Single User by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("parent", "name email role");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: "Invalid user ID", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, email, password, role, parent } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ message: "Name, Email, and Role are required" });
    }

    // Convert parent array to valid ObjectIds
    const parentIds = Array.isArray(parent) 
      ? parent.filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id)) 
      : [];

    // Build update object dynamically (avoid overriding password if not provided)
    const updateData = { name, email, role, parent: parentIds };
    if (password) updateData.password = password; // Only update password if provided

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).json({ message: "Error updating user", error: error.message });
  }
});



// ✅ Delete a User by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting user", error: error.message });
  }
});

module.exports = router;
