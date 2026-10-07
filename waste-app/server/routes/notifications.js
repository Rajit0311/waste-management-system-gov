const router = require("express").Router();
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

router.use(protect);

// Latest 30 + unread count
router.get("/", async (req, res) => {
  const items = await Notification.find({ user: req.user._id }).sort("-createdAt").limit(30);
  const unread = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ items, unread });
});

router.get("/unread", async (req, res) => {
  res.json({ unread: await Notification.countDocuments({ user: req.user._id, read: false }) });
});

router.patch("/read", async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ ok: true });
});

module.exports = router;
