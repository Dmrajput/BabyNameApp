const jwt = require("jsonwebtoken");

const config = require("../config/env");
const BbUser = require("../models/BbUser");

const ADMIN_EMAIL = "divyarajsinh5216@gmail.com";

async function requireAdminEmail(req, res, next) {
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

    const user = await BbUser.findById(decoded.id).select("email name");

    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found for this token." });
    }

    if (String(user.email).toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    req.adminUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired auth token." });
  }
}

module.exports = {
  ADMIN_EMAIL,
  requireAdminEmail,
};
