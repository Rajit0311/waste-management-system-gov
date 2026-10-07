require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/complaints", require("./routes/complaints"));
app.use("/api/employees", require("./routes/employees"));
app.use("/api/notifications", require("./routes/notifications"));

// Error handler (multer errors, async throws)
app.use((err, req, res, next) => res.status(400).json({ error: err.message || "Something went wrong" }));

mongoose.connect(process.env.MONGO_URI).then(() => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API ready on http://localhost:${port}`));
}).catch((e) => { console.error("MongoDB connection failed:", e.message); process.exit(1); });
