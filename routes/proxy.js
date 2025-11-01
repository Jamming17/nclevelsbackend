import express from "express";

const router = express.Router();

router.get("/getLevelId", async (req, res) => {

    try {
        const response = await fetch("http://www.boomlings.com/database/getGJLevels21.php", {
            method: "POST",
            headers: {
                "User-Agent": "",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formatBody({
                secret: "Wmfd2893gb7",
                type: 0,
                star: 1,
                ...req.query
            })
        });
        console.log(new URLSearchParams({
                secret: "Wmfd2893gb7",
                ...req.query
            }).toString());
        const text = await response.text();
        res.json({ success: true, data: text });
    } catch (err) {
        console.error("Proxy error:", err);
        res.status(500).json({ success: false, error: "Failed to contact Boomlings API" });
    }
});

function formatBody(body) {
    return Object.entries(body)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

export default router;