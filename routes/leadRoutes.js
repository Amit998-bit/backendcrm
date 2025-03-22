const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const User = require("../models/User"); // Assuming you have a User model
const XLSX = require('xlsx');
const multer = require('multer');
const path = require('path');

// Configure Multer with unique filenames
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const assignTo = req.body.assignTo; // Extract assignTo from the request body

    const workbook = XLSX.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const headers = data[0];
    const leads = data.slice(1).map(row => {
      const lead = {
        name: '',
        personname: '',
        email: '',
        contact: '',
        address: '',
        description: '',
        progress: '',
        date: '',
        comment: '',
        payment: '',
        balPayment: '',
        clientstatus: '',
        services: [],
        lastdate: '',
        designation: '',
        ownername: '',
        ownerno: '',
        owneremail: '',
        domain: '',
        domainpurchaseby: '',
        domaindate: '',
        domainrenew: '',
        domainid: '',
        domainpass: '',
        domainurl: '',
        assignedTo: assignTo || null,
      };

      headers.forEach((header, index) => {
        if (row[index] !== undefined) {
          lead[header] = row[index];
        }
      });

      if (!lead.email) {
        lead.email = `no-email-${Math.random().toString(36).substring(7)}@example.com`;
      }

      if (!lead.ownerno) {
        lead.ownerno = `no-owner-${Math.random().toString(36).substring(7)}`;
      }

      return lead;
    });

    for (const lead of leads) {
      const existingLead = await Lead.findOne({ contact: lead.contact });
      if (existingLead) {
        // Update existing lead
        await Lead.updateOne({ contact: lead.contact }, lead);
      } else {
        // Insert new lead
        await Lead.create(lead);
      }
    }

    res.status(201).json({ message: 'Leads created or updated successfully' });
  } catch (error) {
    console.error('Error creating leads:', error);
    res.status(500).json({ error: 'Error creating leads' });
  }
});

// Create a New Lead
router.post("/", async (req, res) => {
  try {
    const {
      name, contact, assignedTo, progress, payment, balPayment, address, description, date, comment, email, clientstatus,
      services, lastdate, personname, designation, ownername, ownerno, owneremail, domain, domainpurchaseby, domaindate,
      domainrenew, domainid, domainpass, domainurl
    } = req.body;
    console.log("Received services data:", services);
    const newLead = new Lead({
      name, contact, assignedTo, progress, payment, balPayment, address, description, comment, date, email, clientstatus,
      services, lastdate, personname, designation, ownername, ownerno, owneremail, domain, domainpurchaseby, domaindate,
      domainrenew, domainid, domainpass, domainurl
    });

    await newLead.save();
    res.status(201).json({ message: "Lead added successfully", lead: newLead });
  } catch (error) {
    console.error("Error adding lead:", error);
    res.status(400).json({ message: "Error adding lead", error: error.message });
  }
});

// Get All Leads
router.get("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = {};

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      filter.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.createdAt = { $lte: new Date(endDate) };
    }

    const leads = await Lead.find(filter).populate({
      path: "assignedTo",
      select: "name email role",
    });

    res.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error.message);
    res.status(500).json({ message: "Error fetching leads", error: error.message });
  }
});

router.get("/api/leads", async (req, res) => {
  const { adminId } = req.query;
  try {
    let leads;
    if (adminId) {
      // Fetch leads assigned to admin or their executives
      const executives = await User.find({ parent: adminId }).select("_id");
      const executiveIds = executives.map(exec => exec._id);
      leads = await Lead.find({ assignedTo: { $in: [adminId, ...executiveIds] } }).populate("assignedTo");
    } else {
      leads = await Lead.find().populate("assignedTo");
    }
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leads" });
  }
});

// Get a Single Lead by ID
router.get("/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate("assignedTo", "name email role");
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: "Invalid lead ID", error: error.message });
  }
});

// Update a Lead by ID
router.put("/:id", async (req, res) => {
  try {
    const {
      name, contact, assignedTo, progress, payment, balPayment, address, description, comment, date, email, clientstatus,
      services, lastdate, personname, designation, ownername, ownerno, owneremail, domain, domainpurchaseby, domaindate,
      domainrenew, domainid, domainpass, domainurl
    } = req.body;

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        name, contact, assignedTo, progress, payment, balPayment, address, description, comment, date, email, clientstatus,
        services, lastdate, personname, designation, ownername, ownerno, owneremail, domain, domainpurchaseby, domaindate,
        domainrenew, domainid, domainpass, domainurl
      },
      { new: true, runValidators: true }
    );

    if (!updatedLead) return res.status(404).json({ message: "Lead not found" });

    res.json({ message: "Lead updated successfully", lead: updatedLead });
  } catch (error) {
    res.status(400).json({ message: "Error updating lead", error: error.message });
  }
});

// Delete a Lead by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedLead = await Lead.findByIdAndDelete(req.params.id);
    if (!deletedLead) return res.status(404).json({ message: "Lead not found" });

    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting lead", error: error.message });
  }
});

module.exports = router;
