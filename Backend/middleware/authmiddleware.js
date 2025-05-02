const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
 
  const token = req.header("Authorization")?.split(" ")[1]; 

 
  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
  
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    
    if (verified.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized. Admin access required." });
    }

  
    req.admin = verified;
    next(); 
  } catch (error) {
    console.error("Token verification failed:", error); 
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = verifyAdmin;