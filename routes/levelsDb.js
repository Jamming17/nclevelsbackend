import express from "express";
import { ExtendedDemons, ExtendedNonDemons, MainDemons, MainNonDemons } from "../models/Level.js";

const router = express.Router();

// Parameters: filter = main-demons / extended-demons / all-demons / main-non / extended-non / all-non / main-every / extended-every / all-every
router.get("/getLevels", async (req, res) => {
    try {
        //Fetch from MongoDB
        let levels = [];
        const query = req.query.filter;
        if ((query.startsWith("main") || query.startsWith("all")) && (query.endsWith("demons") || query.endsWith("every"))) {
            levels = levels.concat(await MainDemons.find());
        }
        if ((query.startsWith("extended") || query.startsWith("all")) && (query.endsWith("demons") || query.endsWith("every"))) {
            levels = levels.concat(await ExtendedDemons.find());
        }
        if ((query.startsWith("main") || query.startsWith("all")) && (query.endsWith("non") || query.endsWith("every"))) {
            levels = levels.concat(await MainNonDemons.find());
        }
        if ((query.startsWith("extended") || query.startsWith("all")) && (query.endsWith("non") || query.endsWith("every"))) {
            levels = levels.concat(await ExtendedNonDemons.find());
        }
        if (levels.length > 0) {
            res.json({ success: true, data: levels });
        } else {
            console.error("Incorrect filters");
            res.status(500).json({ success: false, message: "Incorrect filters" });
        }
    } catch(err) {
        console.error("Error fetching levels from MongoDB:", err);
        res.status(500).json({ success: false, message: "Internal server error while fetching level data"});
    }
});

export default router;