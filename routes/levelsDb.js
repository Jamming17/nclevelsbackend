import express from "express";
import Level from "../models/Level.js";

const router = express.Router();

router.get("/getLevels", async (req, res) => {
    try {
        //Fetch from MongoDB
        const levels = await Level.find();
        res.json({ success: true, data: levels });
    } catch(err) {
        console.error("Error fetching levels from MongoDB:", err);
        res.status(500).json({ success: false, message: "Internal server error while fetching level data"});
    }
});

export default router;