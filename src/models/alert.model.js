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
        recipients: { 
            type: [{
                receiptantId: Schema.Types.ObjectId,
                isResponded: [Boolean,false],
                invitationAccepted: Boolean
            }],
            ref: "Individual"
        },
        patientName: {
            type: String,
        },
        currentLocation: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
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
