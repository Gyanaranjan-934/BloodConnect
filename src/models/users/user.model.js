import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
    },
    phone:{
        type: String,
        trim: true,
    },
    bloodGroup: {
        type: String,
    },
    eventId:{
        type: Schema.Types.ObjectId,
        ref: "Event",
    }
},{
    timestamps: true
});

export const User = mongoose.model("User", userSchema);