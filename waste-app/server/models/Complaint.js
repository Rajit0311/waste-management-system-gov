const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, enum: ["garbage_pile", "overflowing_bin", "illegal_dumping", "missed_pickup", "other"], default: "garbage_pile" },
  description: { type: String, required: true, maxlength: 1000 },
  photo: String, // e.g. /uploads/123.jpg
  location: { lat: Number, lng: Number, landmark: String },
  status: { type: String, enum: ["pending", "assigned", "in_progress", "resolved", "rejected"], default: "pending" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  note: String, // admin / employee remark
  resolvedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);
