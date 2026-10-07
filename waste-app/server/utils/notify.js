const Notification = require("../models/Notification");

// Save an in-app notification. Never let a notification failure break the main action.
module.exports = async function notify(userId, complaintId, message) {
  try { if (userId) await Notification.create({ user: userId, complaint: complaintId, message }); }
  catch (e) { console.error("notify failed:", e.message); }
};
