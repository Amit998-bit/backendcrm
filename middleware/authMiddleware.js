const Lead = require("../models/Lead");
const User = require("../models/User");
const checkAccess = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "SuperAdmin") return next();
    let allowedLeads = [];
    if (user.role === "Admin") {
      const subAdmins = await User.find({ parent: user._id });
      const subAdminIds = subAdmins.map(s => s._id);
      const executives = await User.find({ parent: { $in: subAdminIds.concat(user._id) } });
      const execIds = executives.map(e => e._id);
      allowedLeads = await Lead.find({ assignedTo: { $in: execIds.concat(user._id) } });
    } else if (user.role === "Subadmin") {
      const executives = await User.find({ parent: user._id });
      const execIds = executives.map(e => e._id);
      allowedLeads = await Lead.find({ assignedTo: { $in: execIds.concat(user._id) } });
    } else if (user.role === "Executive") {
      allowedLeads = await Lead.find({ assignedTo: user._id });
    }
    req.leads = allowedLeads;
    next();
  } catch (err) {
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};
module.exports = checkAccess;