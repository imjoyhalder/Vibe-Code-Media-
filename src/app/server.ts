import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Vibecode Media API", status: "ok" });
});

// Example route requested by user
app.get("/hello", (req, res) => {
  const name = String(req.query.name || "world");
  res.json({ message: `Hello, ${name}!` });
});

// POST /echo receives JSON and returns it back
app.post("/echo", (req, res) => {
  res.json({ youSent: req.body });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
