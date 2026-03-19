const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const config = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const nameRoutes = require("./routes/nameRoutes");
const aiRoutes = require("./routes/aiRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");

const app = express();
const port = config.port;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Auth API is running." });
});

app.use("/auth", authRoutes);
app.use("/api/names", nameRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api", aiRoutes);

async function startServer() {
  await mongoose.connect(config.mongodbUri);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
