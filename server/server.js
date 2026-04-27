const express = require("express");
const multer = require("multer");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("fs");

const app = express();

// ✅ CORS (allow frontend)
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// ✅ ENSURE UPLOAD FOLDER EXISTS
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ✅ FILE STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("GlobeGate Freight Backend is Live 🚀");
});

// ✅ EMAIL SETUP (IMPORTANT)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // 🔥 from Render
    pass: process.env.EMAIL_PASS    // 🔥 from Render
  }
});

// ✅ APPLY ROUTE
app.post("/apply", upload.fields([
  { name: "resume" },
  { name: "idFront" },
  { name: "idBack" }
]), async (req, res) => {

  try {

    console.log("NEW APPLICATION RECEIVED");

    const data = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Job Application",
      text: `
Name: ${data.firstName} ${data.surname}
Phone: ${data.phone}
Email: ${data.email}
Position: ${data.position}

Payment Type: ${data.paymentType}
Bank: ${data.bankName}

Skills: ${data.skills}

FILES:
Resume: ${req.files?.resume?.[0]?.originalname || "None"}
ID Front: ${req.files?.idFront?.[0]?.originalname || "None"}
ID Back: ${req.files?.idBack?.[0]?.originalname || "None"}
      `
    };

    await transporter.sendMail(mailOptions);

    console.log("EMAIL SENT ✅");

    res.json({ message: "Application sent successfully 📩" });

  } catch (error) {
    console.log("ERROR:", error);
    res.json({ message: "Email failed ❌" });
  }

});

// ✅ PORT FOR RENDER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});