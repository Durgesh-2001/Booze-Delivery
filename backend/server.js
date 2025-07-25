import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import productRouter from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from './routes/notifications.js';
import { authenticateToken } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// ✅ Validate required environment variables
const requiredEnvVars = ['MONGODB_URL', 'JWT_SECRET', 'ADMIN_JWT_SECRET', 'ALLOWED_ORIGINS'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ ${envVar} not defined in .env file.`);
    process.exit(1);
  }
}

// ✅ Parse and log allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
console.log("✅ CORS Allowed Origins:", allowedOrigins);

// ✅ Middleware: CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Origin not allowed by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ Middleware: Body parser
app.use(express.json());

// ✅ Static files
app.use("/uploads", express.static("uploads"));
app.use("/images", express.static("uploads"));

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", authenticateToken, paymentRoutes);
app.use("/api/orders", authenticateToken, orderRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);

// ✅ Health check
app.get("/", (_req, res) => {
  res.send("API Working!");
});

// ✅ Global error handler
app.use((err, _req, res, _next) => {
  console.error("Global error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();