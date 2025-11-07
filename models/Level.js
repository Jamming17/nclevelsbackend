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
    length: {type: String, required: false, unique: false }
});

export const MainDemons = mongoose.model("main-demons", levelSchema);
export const ExtendedDemons = mongoose.model("extended-demons", levelSchema);
export const MainNonDemons = mongoose.model("main-non-demons", levelSchema);
export const ExtendedNonDemons = mongoose.model("extended-non-demons", levelSchema);