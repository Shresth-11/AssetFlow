const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Import routes
const authRouter = require("./routes/auth");
const orgRouter = require("./routes/org");
const assetsRouter = require("./routes/assets");
const allocationsRouter = require("./routes/allocations");
const bookingsRouter = require("./routes/bookings");
const maintenanceRouter = require("./routes/maintenance");
const auditsRouter = require("./routes/audits");
const analyticsRouter = require("./routes/analytics");
const notificationsRouter = require("./routes/notifications");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parser Middleware
app.use(express.json());

// Bind REST routes
app.use("/api/auth", authRouter);
app.use("/api/org", orgRouter);
app.use("/api/assets", assetsRouter);
app.use("/api/allocations", allocationsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/audits", auditsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/notifications", notificationsRouter);

// Base route for connectivity checks
app.get("/", (req, res) => {
  return res.json({
    name: "AssetFlow ERP API",
    version: "1.0.0",
    status: "Healthy",
  });
});

// 404 Route handler
app.use((req, res) => {
  return res.status(404).json({ error: `Endpoint ${req.method} ${req.url} not found` });
});

// Global Error-Handling Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  const statusCode = err.status || 500;
  return res.status(statusCode).json({
    error: err.message || "An unexpected system error occurred on the server.",
  });
});

// Launch Express Server
app.listen(PORT, () => {
  console.log(`[Server] AssetFlow ERP Backend is active on http://localhost:${PORT}`);
});

module.exports = app;
