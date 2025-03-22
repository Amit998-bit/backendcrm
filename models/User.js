const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // Hashed password
  role: { type: String, enum: ["SuperAdmin", "Admin", "Subadmin", "Executive"], required: true },
  parent:[{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
  leaves: {
    EL: { type: Number, default: 10 }, // Example default values
    CL: { type: Number, default: 5 },
    SL: { type: Number, default: 7 },
  },
});
module.exports = mongoose.model("User", userSchema);