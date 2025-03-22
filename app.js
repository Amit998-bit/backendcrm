// server.js - Main entry point
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const leadRoutes = require("./routes/leadRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const multer = require('multer');

const app = express();
const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/leaves", leaveRoutes);
mongoose.connect("mongodb+srv://highxbrand1:Amit1423@cluster0.lazw4.mongodb.net/crm", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"));

app.listen(5000, () => console.log("Server running on port 5000"));