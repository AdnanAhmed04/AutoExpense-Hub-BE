const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("../config/db"); // <-- IMPORTANT (../)

dotenv.config();

const app = express();

// --- CORS ---
// Reflect known frontend origins and handle preflight (OPTIONS) requests.
const allowedOrigins = [
    "https://autoexpense-hub-fe.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow non-browser requests (no origin) and any allowed origin.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(null, true); // fall back to allow; tighten if needed
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight for all routes

app.use(express.json());

// Ensure DB is connected before handling API routes. If the connection
// fails we return a JSON error (with CORS headers already applied) instead
// of letting the serverless function crash with no response.
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("DB connection failed:", error.message);
        res.status(503).json({ message: "Database connection failed" });
    }
});

// Optional: root route so "/" doesn't 404
app.get("/", (req, res) => {
    res.send("Backend running 🚀");
});

// Routes
app.use("/api/auth", require("../routes/authRoutes")); // <-- IMPORTANT (../)
app.use("/api/cars", require("../routes/carRoutes"));
app.use("/api/expenses", require("../routes/expenseSingleRoutes"));
app.use("/api/documents", require("../routes/documentRoutes"));
app.use("/api/gallery", require("../routes/galleryRoutes"));

module.exports = app;
