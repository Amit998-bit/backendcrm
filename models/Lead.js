const mongoose = require("mongoose"); // Import mongoose

const leadSchema = new mongoose.Schema({
  name: String,
  personname:String,
  email: {
    type: String,
    unique: true, // Ensure email is unique
  
  },
  contact: {
    type: String,
    unique: true, // Ensure email is unique
  },
  address:String,
  description:String,
  progress:String,
  date:String,
  comment:String,
  payment:String,
  balPayment:String,
  clientstatus:String,
  services: [{
    name: String,
    buydate: Date,
    expirydate: Date,
     default: [] }],
  lastdate:String,
  designation:String,
  ownername:String,
  ownerno:{
    type: String,
    unique: true, // Ensure email is unique
  },
  owneremail:String,
  domain:String,
  domainpurchaseby:String,
  domaindate:String,
  domainrenew:String,
  domainid:String,
  domainpass:String,
  domainurl:String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
},
{ timestamps: true } // Automatically adds createdAt & updatedAt
);

module.exports = mongoose.model("Lead", leadSchema);
    