
import dotenv from "dotenv";
import express from "express";
import mainRouter from "./routes/index.route.js";
import { globalErrorHandler } from "./lib/globalErrorHandler.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

// Required JSON parser for incoming requests
app.use(express.json());

// Routes
app.use('/api/v1', mainRouter);

// Health check route (outside /api for direct access)
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Vibecode Media API", status: "ok" });
});

// Global error handler
app.use(globalErrorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    // console.log("database url:", process.env.DATABASE_URL);
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;

