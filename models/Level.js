import mongoose from "mongoose";

const levelSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, unique: false },
    creator: { type: String, required: true, unique: false },
    difficulty: { type: String, required: true, unique: false },
    stars: { type: Number, required: true, unique: false },
    rating: { type: String, required: true, unique: false },
    coin_count: { type: Number, required: true, unique: false },
    coins_rated: { type: Boolean, required: true, unique: false }
});

const Level = mongoose.model("Level", levelSchema);
export default Level;