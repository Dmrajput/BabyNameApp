const jwt = require("jsonwebtoken");

const config = require("../config/env");
const BbUser = require("../models/BbUser");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Missing or invalid auth token." });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    const decoded = jwt.verify(token, config.jwtSecret);

    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid auth token payload." });
    }

    const user = await BbUser.findById(decoded.id).select("_id name email");

    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found for this token." });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired auth token." });
  }
}

module.exports = {
  requireAuth,
};
