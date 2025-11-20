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

        // Detect if thumbnail is available
        levelData.thumbnailAvailable = await thumbnailAvailableCheck(levelData.id);

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
            console.error("Level not found in databases.");
        }

        /* Return success */
        res.json({ success: true, data: levelData });
    } catch (err) {
        console.error("Proxy error:", err);
        res.status(500).json({ success: false, error: "Failed to contact Boomlings API" });
    }
});

async function thumbnailAvailableCheck(levelid) {
    console.log("=== Thumbnail Search ===\nLevel ID:", levelid);
    try {
        const response = await fetch(`https://levelthumbs.prevter.me/thumbnail/${levelid}/small`, { method: "HEAD" });
        console.log("Content-Type:", response.headers.get("content-type")?.startsWith("image"));
        if (!response.ok || !response.headers.get("content-type")?.startsWith("image")) {
            return false;
        }
        return true;
    } catch (err) {
        console.error(`Image check for level with id ${levelid} failed with error ${err}`);
        return false;
    }
}

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

async function retrieveSongInfo(songid) {
    try {
        console.log("Searching for song with ID", songid);
        const response = await fetch ("http://www.boomlings.com/database/getGJSongInfo.php", {
            method: "POST",
            headers: {
                "User-Agent": "",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formatBody({
                secret: "Wmfd2893gb7",
                songID: songid
            })
        });
        const text = await response.text();
        console.log(text);
        
        if (text == -2) {
            return {songName: "error", songCreator: "error"};
        }

        let song = {songName: "error", songCreator: "error"};
        const parts = text.split("~|~");
        const data = [];
        for (let i = 0; i < parts.length; i += 2) {
            const index = parts[i];
            data[index] = parts[i + 1];
            console.log(`Index ${index}:   ${parts[i+1]}`)
        }
        song.songName = data[2];
        song.songCreator = data[4];
        return song;
    } catch (err) {
        console.error("Error fetching song info:", err);
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
    console.log(responseString);
    
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

    //Handle song
    const songid = data[35].substring(0, data[35].indexOf("#"));
    let song = {songName: "error", songCreator: "error"};
    if (songid == 0) {
        const robtopSongId = data[12];
        if (robtopSongId == 0) {song = {songName: "Stereo Madness", songCreator: "ForeverBound"}}
        else if (robtopSongId == 1) {song = {songName: "Back on Track", songCreator: "DJVI"}}
        else if (robtopSongId == 2) {song = {songName: "Polargeist", songCreator: "Step"}}
        else if (robtopSongId == 3) {song = {songName: "Dry Out", songCreator: "DJVI"}}
        else if (robtopSongId == 4) {song = {songName: "Base After Base", songCreator: "DJVI"}}
        else if (robtopSongId == 5) {song = {songName: "Can't Let Go", songCreator: "DJVI"}}
        else if (robtopSongId == 6) {song = {songName: "Jumper", songCreator: "Waterflame"}}
        else if (robtopSongId == 7) {song = {songName: "Time Machine", songCreator: "Waterflame"}}
        else if (robtopSongId == 8) {song = {songName: "Cycles", songCreator: "DJVI"}}
        else if (robtopSongId == 9) {song = {songName: "xStep", songCreator: "DJVI"}}
        else if (robtopSongId == 10) {song = {songName: "Clutterfunk", songCreator: "Waterflame"}}
        else if (robtopSongId == 11) {song = {songName: "Theory of Everything", songCreator: "DJ-Nate"}}
        else if (robtopSongId == 12) {song = {songName: "Electroman Adventures", songCreator: "Waterflame"}}
        else if (robtopSongId == 13) {song = {songName: "Clubstep", songCreator: "DJ-Nate"}}
        else if (robtopSongId == 14) {song = {songName: "Electrodynamix", songCreator: "DJ-Nate"}}
        else if (robtopSongId == 15) {song = {songName: "Hexagon Force", songCreator: "Waterflame"}}
        else if (robtopSongId == 16) {song = {songName: "Blast Processing", songCreator: "Waterflame"}}
        else if (robtopSongId == 17) {song = {songName: "Theory of Everything 2", songCreator: "DJ-Nate"}}
        else if (robtopSongId == 18) {song = {songName: "Geometrical Dominator", songCreator: "Waterflame"}}
        else if (robtopSongId == 19) {song = {songName: "Deadlocked", songCreator: "F-777"}}
        else if (robtopSongId == 20) {song = {songName: "Fingerbang", songCreator: "MDK"}}
        else if (robtopSongId == 21) {song = {songName: "Dash", songCreator: "MDK"}}
    } else {
        song = await retrieveSongInfo(songid);
    }


    const level = {
        id: data[1],
        name: data[2],
        creator,
        difficulty,
        stars: parseInt(data[18]),
        rating,
        coin_count: parseInt(data[37]),
        coins_rated: data[38] == 1 ? true : false,
        length,
        downloads: parseInt(data[10]),
        likes: parseInt(data[14]),
        songId: parseInt(data[35]),
        songName: song.songName,
        songCreator: song.songCreator
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