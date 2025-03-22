const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const Leave = require("../models/Leave"); // Assuming you have a Leave model

// Route to apply for leave
router.post("/apply", async (req, res) => {
  try {
    const { userId, leaveType, startDate, endDate, reason } = req.body;
    if (!userId || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const leaveApplication = await leaveController.applyLeave(userId, leaveType, startDate, endDate, reason);
    res.status(201).json(leaveApplication);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to get leave applications for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const leaves = await Leave.find({ user: userId }).populate("user", "name email");
    res.status(200).json(leaves);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to get all leave applications (for admins)
router.get("/", async (req, res) => {
  try {
    const leaves = await Leave.find().populate("user", "name email");
    res.status(200).json(leaves);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to update leave status
router.put("/update/:leaveId", async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    const updatedLeave = await leaveController.updateLeaveStatus(leaveId, status);
    res.status(200).json(updatedLeave);
  } catch (error) {
    res.status(400).json({ error: error.message });
  } 
});

module.exports = router;
