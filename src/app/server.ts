
import dotenv from "dotenv";
import express from "express";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

// Required JSON parser for incoming requests
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Vibecode Media API", status: "ok" });
});

// Generic 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });

});

app.listen(PORT, () => {
    // console.log("database url:", process.env.DATABASE_URL);
    console.log(`Server is running on http://localhost:${PORT}`);
});

