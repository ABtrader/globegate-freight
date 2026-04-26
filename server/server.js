const express = require("express");
const multer = require("multer");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// FIX: allow frontend to connect after deployment
app.use(cors({
  origin: "*"
}));

// FILE STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("GlobeGate Freight Backend is Live 🚀");
});

// EMAIL SETUP (put your real Gmail + app password later)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "YOUR_EMAIL@gmail.com",
    pass: "YOUR_APP_PASSWORD"
  }
});

// MAIN APPLY ROUTE
app.post("/apply", upload.fields([
  { name: "resume" },
  { name: "idFront" },
  { name: "idBack" }
]), (req, res) => {

  const data = req.body;

  console.log("NEW APPLICATION RECEIVED");

  const mailOptions = {
    from: "GlobeGate Freight",
    to: "YOUR_EMAIL@gmail.com",
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
Resume: ${req.files.resume?.[0]?.originalname}
ID Front: ${req.files.idFront?.[0]?.originalname}
ID Back: ${req.files.idBack?.[0]?.originalname}
    `
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
      return res.json({ message: "Email failed ❌" });
    }

    res.json({ message: "Application sent successfully 📩" });
  });

});

// IMPORTANT FOR RENDER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});