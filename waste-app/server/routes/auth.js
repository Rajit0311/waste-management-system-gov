const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

// Public sign up always creates a citizen. Admins/employees are created by seed / admin.
router.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ error: "Name, email and a password of 6+ characters are required" });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: "This email is already registered" });
  const user = await User.create({ name, email, phone, password, role: "citizen" });
  res.status(201).json({ token: sign(user), user: pub(user) });
});

async function login(req, res, allowedRoles) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() }).select("+password");
  if (!user || !(await user.matches(password || "")))
    return res.status(401).json({ error: "Wrong email or password" });
  if (!allowedRoles.includes(user.role))
    return res.status(403).json({ error: "This account can't log in here" });
  res.json({ token: sign(user), user: pub(user) });
}
router.post("/login", (req, res) => login(req, res, ["citizen", "employee"]));
router.post("/admin-login", (req, res) => login(req, res, ["admin"]));
router.get("/me", protect, (req, res) => res.json({ user: pub(req.user) }));

module.exports = router;
