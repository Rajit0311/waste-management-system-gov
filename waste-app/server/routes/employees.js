const router = require("express").Router();
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const { protect, allow } = require("../middleware/auth");

router.use(protect, allow("admin"));

// List employees with their open task count
router.get("/", async (req, res) => {
  const list = await User.find({ role: "employee" }).sort("name").lean();
  const open = await Complaint.aggregate([
    { $match: { status: { $in: ["assigned", "in_progress"] }, assignedTo: { $ne: null } } },
    { $group: { _id: "$assignedTo", n: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(open.map((o) => [String(o._id), o.n]));
  res.json(list.map((e) => ({ ...e, openTasks: map[String(e._id)] || 0 })));
});

router.post("/", async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: "This email is already registered" });
  const u = await User.create({ name, email, phone, password, role: "employee" });
  res.status(201).json({ _id: u._id, name: u.name, email: u.email, phone: u.phone, openTasks: 0 });
});

module.exports = router;
