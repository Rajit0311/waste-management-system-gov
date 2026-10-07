const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const notify = require("../utils/notify");
const { protect, allow } = require("../middleware/auth");

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "..", "uploads"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + Math.round(Math.random() * 1e6) + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(file.mimetype.startsWith("image/") ? null : new Error("Only image files are allowed"), file.mimetype.startsWith("image/")),
});

const populate = (q) => q.populate("citizen", "name phone email").populate("assignedTo", "name phone");

// Citizen: raise a complaint (photo + location)
router.post("/", protect, allow("citizen"), upload.single("photo"), async (req, res) => {
  const { category, description, lat, lng, landmark } = req.body;
  if (!description) return res.status(400).json({ error: "Please describe the problem" });
  if (!req.file) return res.status(400).json({ error: "Please add a photo of the waste" });
  if (!lat || !lng) return res.status(400).json({ error: "Please share your location" });
  const c = await Complaint.create({
    citizen: req.user._id, category, description,
    photo: "/uploads/" + req.file.filename,
    location: { lat: Number(lat), lng: Number(lng), landmark },
  });
  res.status(201).json(c);
});

// Citizen: my complaints
router.get("/mine", protect, allow("citizen"), async (req, res) => {
  res.json(await populate(Complaint.find({ citizen: req.user._id }).sort("-createdAt")));
});

// Employee: tasks assigned to me
router.get("/assigned", protect, allow("employee"), async (req, res) => {
  res.json(await populate(Complaint.find({ assignedTo: req.user._id }).sort("-updatedAt")));
});

// Admin: all complaints (+ ?status=)
router.get("/", protect, allow("admin"), async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  res.json(await populate(Complaint.find(filter).sort("-createdAt")));
});

// Admin: dashboard numbers
router.get("/stats", protect, allow("admin"), async (req, res) => {
  const rows = await Complaint.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]);
  const stats = { pending: 0, assigned: 0, in_progress: 0, resolved: 0, rejected: 0 };
  rows.forEach((r) => (stats[r._id] = r.n));
  stats.total = Object.values(stats).reduce((a, b) => a + b, 0);
  res.json(stats);
});

// Admin: assign to an employee
router.patch("/:id/assign", protect, allow("admin"), async (req, res) => {
  const emp = await User.findOne({ _id: req.body.employeeId, role: "employee" });
  if (!emp) return res.status(400).json({ error: "Choose a valid employee" });
  const c = await Complaint.findByIdAndUpdate(
    req.params.id,
    { assignedTo: emp._id, status: "assigned", note: req.body.note },
    { new: true }
  );
  if (!c) return res.status(404).json({ error: "Complaint not found" });
  await notify(c.citizen, c._id, `Your report has been assigned to ${emp.name}. The cleanup crew will get to it soon.`);
  await notify(emp._id, c._id, "A new cleanup task has been assigned to you.");
  res.json(await populate(Complaint.findById(c._id)));
});

// Admin (any) or assigned employee: update status
router.patch("/:id/status", protect, allow("admin", "employee"), async (req, res) => {
  const c = await Complaint.findById(req.params.id);
  if (!c) return res.status(404).json({ error: "Complaint not found" });
  if (req.user.role === "employee" && String(c.assignedTo) !== String(req.user._id))
    return res.status(403).json({ error: "This task isn't assigned to you" });
  const { status, note } = req.body;
  if (!["in_progress", "resolved", "rejected", "pending"].includes(status))
    return res.status(400).json({ error: "Invalid status" });
  c.status = status;
  if (note) c.note = note;
  if (status === "resolved") c.resolvedAt = new Date();
  await c.save();
  const msg = {
    in_progress: "Work has started on your report.",
    resolved: "Good news: the waste from your report has been cleaned. Thank you for reporting!",
    rejected: "Your report was closed by the city office." + (note ? " Note: " + note : ""),
  }[status];
  if (msg) await notify(c.citizen, c._id, msg);
  res.json(await populate(Complaint.findById(c._id)));
});

module.exports = router;
