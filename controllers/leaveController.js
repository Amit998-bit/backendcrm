const Leave = require("../models/Leave");
const User = require("../models/User");

async function applyLeave(userId, leaveType, startDate, endDate, reason) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.leaves[leaveType] <= 0) {
      throw new Error(`No ${leaveType} leaves remaining`);
    }

    const leaveApplication = new Leave({
      user: userId,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    await leaveApplication.save();

    // Deduct the leave from the user's balance
    user.leaves[leaveType] -= 1;
    await user.save();

    return leaveApplication;
  } catch (error) {
    throw new Error(`Error applying leave: ${error.message}`);
  }
}

async function updateLeaveStatus(leaveId, status) {
  try {
    const leave = await Leave.findById(leaveId);
    if (!leave) {
      throw new Error("Leave application not found");
    }

    leave.status = status;
    await leave.save();

    return leave;
  } catch (error) {
    throw new Error(`Error updating leave status: ${error.message}`);
  }
}

module.exports = { applyLeave, updateLeaveStatus };
