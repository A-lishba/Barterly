require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const matchRoutes = require("./routes/matchRoutes");
const swapRoutes = require("./routes/swapRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Barterly API is running ✅");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/swap", swapRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Barterly backend running on port ${PORT}`));
