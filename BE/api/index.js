const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("../config/db"); // <-- IMPORTANT (../)

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Optional: root route so "/" doesn't 404
app.get("/", (req, res) => {
    res.send("Backend running 🚀");
});

// Routes
app.use("/api/auth", require("../routes/authRoutes")); // <-- IMPORTANT (../)
app.use("/api/cars", require("../routes/carRoutes"));
app.use("/api/expenses", require("../routes/expenseSingleRoutes"));

module.exports = app;