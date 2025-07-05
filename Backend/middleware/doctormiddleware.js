const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");

module.exports = async function verifyDoctorToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: "No token provided" });

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find doctor by ID from token
    const doctor = await Doctor.findById(decoded.id);
    if (!doctor) return res.status(401).json({ success: false, message: "Doctor not found" });

    req.doctor = doctor;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
