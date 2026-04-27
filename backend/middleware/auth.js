const jwt = require("jsonwebtoken");
const config = require("../config/env");
const BbUser = require("../models/BbUser");

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify token using your config
    const decoded = jwt.verify(token, config.jwtSecret);

    // Get user from database
    const user = await BbUser.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    res.status(401).json({ error: "Invalid token" });
  }
};

// Alias for compatibility with existing routes
const requireAuth = auth;

module.exports = { auth, requireAuth };
