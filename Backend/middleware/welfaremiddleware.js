const jwt = require("jsonwebtoken");
const WelfareOrganization = require("../models/WelfareOrganization");

const verifyWelfareToken = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const welfare = await WelfareOrganization.findById(decoded.id);

    if (!welfare) {
      return res.status(404).json({ message: "Welfare not found" });
    }

    req.user = { id: welfare._id }; // Attach user ID to the request
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyWelfareToken;
