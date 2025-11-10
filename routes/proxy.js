import express from "express";
import { Levels } from "../models/Level.js";
import { mongo } from "mongoose";

const router = express.Router();

router.get("/getLevelId", async (req, res) => {
    try {
        /* Handle response */
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
        const levelData = await processLevelResponse(text);

        console.log(text);

        /* Update database if necessary */
        const mongoLevelSearch = await Levels.find({ id: req.query.str });
        if (mongoLevelSearch.length === 1) {
            const mongoLevel = mongoLevelSearch[0];

            // Compare fields
            const updates = {};
            console.log(levelData);
            for (const key of Object.keys(levelData)) {
                if (levelData[key].toString() !== mongoLevel[key].toString()) {
                    updates[key] = levelData[key];
                }
            }

            // Update mongodb fields if necessary
            if (Object.keys(updates).length > 0) {
                await Levels.updateOne({id: mongoLevel.id }, {$set: updates});
                console.log(`Updated level in database.\nWas: ${JSON.stringify(mongoLevel)}\nUpdated: ${JSON.stringify(updates)}`);
            } else {
                console.log("No update needed.");
            }

            // Add additional non-GD fields to the response
            levelData.extra = mongoLevel.extra;
            levelData.tags = mongoLevel.tags;
        } else {
            console.error("Level not found in datbases.");
        }

        /* Return success */
        res.json({ success: true, data: levelData });
    } catch (err) {
        console.error("Proxy error:", err);
        res.status(500).json({ success: false, error: "Failed to contact Boomlings API" });
    }
});

async function retrieveCreatorUsername(userid) {
    try {
        console.log("Searching for user with ID", userid);
        const response = await fetch ("http://www.boomlings.com/database/getGJUsers20.php", {
            method: "POST",
            headers: {
                "User-Agent": "",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formatBody({
                secret: "Wmfd2893gb7",
                str: userid
            })
        });
        const text = await response.text();
        if (text == -1) {
            return "-";
        }
        const username = processResponse(text)[1];
        return username;
    } catch (err) {
        console.error("Error fetching username:", err);
    }
}

function processResponse(responseString) {
    const firstEntry = responseString.split("|")[0];
    const parts = firstEntry.split(":");
    const data = [];
    for (let i = 0; i < parts.length; i += 2) {
        const index = parts[i];
        data[index] = parts[i + 1];
        console.log(`Index ${index}:   ${parts[i+1]}`)
    }
    return data;
}

async function processLevelResponse(responseString) {
    const data = processResponse(responseString);
    
    //Determine difficulty
    let difficulty = "error";
    if (data[25] == 1) {
        difficulty = "Auto"
    } else {
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

    //Determine level length
    let length = "error";
    if (data[15] == 0) {
        length = "Tiny";
    } else if (data[15] == 1) {
        length = "Short";
    } else if (data[15] == 2) {
        length = "Medium";
    } else if (data[15] == 3) {
        length = "Long";
    } else if (data[15] == 4) {
        length = "XL";
    } else if (data[15] == 5) {
        length = "Plat.";
    }

    //Handle usernames
    const creator = await retrieveCreatorUsername(data[6]);

    const level = {
        id: data[1],
        name: data[2],
        creator,
        difficulty,
        stars: data[18],
        rating,
        coin_count: data[37],
        coins_rated: data[38] == 1 ? true : false,
        length
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