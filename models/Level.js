import mongoose from "mongoose";

const levelSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: false, unique: false },
    creator: { type: String, required: false, unique: false },
    difficulty: { type: String, required: false, unique: false },
    stars: { type: Number, required: false, unique: false },
    rating: { type: String, required: false, unique: false },
    coin_count: { type: Number, required: false, unique: false },
    coins_rated: { type: Boolean, required: false, unique: false },
    length: { type: String, required: false, unique: false },
    extra: { type: Boolean, required: false, unique: false },
    tags: { type: [String], required: false, unique: false }
});

export const Levels = mongoose.model("levels", levelSchema);