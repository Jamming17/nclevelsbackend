import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import proxyRoutes from "./routes/proxy.js";
import levelRoutes from "./routes/levelsDb.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/jack/gd/boomlings", proxyRoutes);
app.use("/jack/gd/database", levelRoutes);
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});