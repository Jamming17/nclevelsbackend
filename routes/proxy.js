import express, { response } from "express";

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
        const levelData = processLevelResponse(text);
        res.json({ success: true, data: levelData });
    } catch (err) {
        console.error("Proxy error:", err);
        res.status(500).json({ success: false, error: "Failed to contact Boomlings API" });
    }
});

function processLevelResponse(responseString) {
    const firstLevel = responseString.split("|")[0];
    const parts = firstLevel.split(":");
    const data = [];
    for (let i = 0; i < parts.length; i += 2) {
        const index = parts[i];
        data[index] = parts[i + 1];
        console.log(`Index ${index}:   ${parts[i+1]}`)
    }
    console.log(data.length)
    
    //Determine difficulty
    let difficulty = "error";
    if (data[17] == 0) {
        if (data[9] == 10) {
            difficulty = "Easy";
        } else if (data[9] == 20){
            difficulty = "Normal";
        } else if (data[9] == 30){
            difficulty = "Hard";
        } else if (data[9] == 40){
            difficulty = "Harder";
        } else if (data[9] == 50){
            difficulty = "Insane";
        }
    } else {
        if (data[43] == 3) {
            difficulty = "Easy Demon";
        } else if (data[43] == 4) {
            difficulty = "Medium Demon";
        } else if (data[43] == 0) {
            difficulty = "Hard Demon";
        } else if (data[43] == 5) {
            difficulty = "Insane Demon";
        } else if (data[43] == 6) {
            difficulty = "Extreme Demon";
        }
    }

    //Determine rating type
    let rating = "error";
    if (data[42] == 0) {
        if (data[19] == 0) {
            rating = "Star Rate";
        } else {
            rating = "Featured";
        }
    } else if (data[42] == 1) {
        rating = "Epic";
    } else if (data[42] == 2) {
        rating = "Legendary";
    } else if (data[42] == 3) {
        rating = "Mythic";
    }

    const level = {
        id: data[1],
        name: data[2],
        creator: data[6], // Currently only creator ID, not username
        difficulty,
        stars: data[18],
        rating,
        coin_count: data[37],
        coins_rated: data[38] == 1 ? true : false
    }
    console.log(`Level data: ${JSON.stringify(level)}`)
    return level;
}

function formatBody(body) {
    return Object.entries(body)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

export default router;

/*
LevelType = {
    id: number;             #1
    name: string;           #2
    creator: string;        #6 as a player ID
    difficulty: string;     #9 (10=easy, 20=normal, 30=hard, 40=harder, 50=insane)
                            #17 (boolean; is it a demon?)
                            #43 (demon difficulty: 3=easy, 4=medium, 0=hard, 5=insane, 6=extreme)

    stars:                  #18
    rating: string;         #19 (0=not featued, >0 = featured)
                            #42 (0=not epic, 1=epic, 2=legendary, 3=mythic)

    coin_count: number;     #37
    coins_rated: boolean;   #38
}
    */