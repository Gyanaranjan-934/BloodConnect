import mongoose, { Schema } from "mongoose";

const alertSchema = new Schema(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        senderType: {
            type: String,
            required: true,
            enum: ["Organization", "Individual"],
        },
        patientName: {
            type: String,
        },
        currentLocation: {
            type: { type: String },
            coordinates: [Number],
        },
        expiryTime: {
            type: Date,
            required: true,
        },
        isExpired: {
            type: Boolean,
            default: false,
        },
        patientPhoto: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export const Alert = mongoose.model("Alert", alertSchema);
