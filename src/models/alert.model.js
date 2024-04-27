import mongoose, { Schema } from "mongoose";

const alertSchema = new Schema(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: function() {
                return this.senderType === 'Individual' ? 'Individual' : 'Organization';
            }
        },
        senderType: {
            type: String,
            required: true,
            enum: ["Organization", "Individual"],
        },
        recipients: [{
            recipientId: {
                type: Schema.Types.ObjectId,
                ref: "Individual",
            },
            isResponded: {
                type: Boolean,
                default: false,
            },
            invitationAccepted: {
                type: Boolean,
                default: false,
            },
        }],
        patientName: {
            type: String,
        },
        age: {
            type: Number,
        },
        gender: {
            type: String,
        },
        bloodGroup: {
            type: String,
        },
        address: {
            type: String,
        },
        problemDescription: {
            type: String,
        },
        dateOfRequirement: {
            type: Date,
        },
        currentLocation: {
            type: {
                type: String, // Don't do `{ location: { type: String } }`
                enum: ["Point"], // 'location.type' must be 'Point'
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
        isSendToRecipients: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Alert = mongoose.model("Alert", alertSchema);
