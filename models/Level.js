import mongoose from "mongoose";

const levelSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: false, unique: false },
    creator: { type: String, required: false, unique: false },
    difficulty: { type: String, required: false, unique: false },
    stars: { type: Number, required: false, unique: false },
    rating: { type: String, required: false, unique: false },
    coin_count: { type: Number, required: false, unique: false },
    coins_rated: { type: Boolean, required: false, unique: false }
});

const Level = mongoose.model("Level", levelSchema);
export default Level;