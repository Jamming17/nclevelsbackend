import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/proxy.js"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/jack/gd", authRoutes);
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});



const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});