const jwt = require("jsonwebtoken");
const WelfareOrganization = require("../models/WelfareOrganization");

const verifyWelfareToken = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized. No token provided." });
  }

  try {
    // Add debugging for token verification
    console.log("Welfare middleware - Verifying token");
    
    // Decode token without verification for debugging
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log("Welfare middleware - Token payload:", {
          id: payload.id,
          role: payload.role,
          exp: payload.exp,
          expDate: new Date(payload.exp * 1000).toISOString(),
          now: new Date().toISOString(),
          diff: (payload.exp * 1000) - Date.now()
        });
      }
    } catch (decodeError) {
      console.error("Welfare middleware - Error decoding token:", decodeError);
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const welfare = await WelfareOrganization.findById(decoded.id);

    if (!welfare) {
      console.log("Welfare middleware - Welfare not found for ID:", decoded.id);
      return res.status(404).json({ message: "Welfare not found" });
    }

    console.log("Welfare middleware - Token verified for welfare:", welfare._id);
    req.user = { id: welfare._id, role: 'welfare' }; // Attach user ID and role to the request
    next();
  } catch (error) {
    console.error("Welfare middleware - Token verification failed:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyWelfareToken;
