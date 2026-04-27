const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const config = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const nameRoutes = require("./routes/nameRoutes");
const aiRoutes = require("./routes/aiRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const countryRoutes = require("./routes/countryRoutes");

// Baby Care Routes
const feedingRoutes = require("./routes/feedingRoutes");
const sleepRoutes = require("./routes/sleepRoutes");
const diaperRoutes = require("./routes/diaperRoutes");
const vaccinationRoutes = require("./routes/vaccinationRoutes");
const pregnancyRoutes = require("./routes/pregnancyRoutes");
const milestoneRoutes = require("./routes/milestoneRoutes");
const journalRoutes = require("./routes/journalRoutes");

const { requireAdminEmail } = require("./middleware/adminAuth");
const { uploadNames } = require("./controllers/nameController");

const app = express();
const port = config.port;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Auth API is running." });
});

app.use("/auth", authRoutes);
app.use("/api/names", nameRoutes);
app.post("/api/upload-names", requireAdminEmail, uploadNames);
app.use("/api/favorites", favoriteRoutes);
app.use("/categories", categoryRoutes);
app.use("/countries", countryRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api", aiRoutes);

// Baby Care API Routes
app.use("/api/feeding", feedingRoutes);
app.use("/api/sleep", sleepRoutes);
app.use("/api/diaper", diaperRoutes);
app.use("/api/vaccination", vaccinationRoutes);
app.use("/api/pregnancy", pregnancyRoutes);
app.use("/api/milestone", milestoneRoutes);
app.use("/api/journal", journalRoutes);

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
