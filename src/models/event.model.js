import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const eventSchema = new Schema(
    {
        eventName: {
            type: String,
            required: true,
        },
        eventHeadName: {
            type: String,
            required: true,
        },
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
        },
        doctors: {
            type: [Schema.Types.ObjectId],
            ref: "Doctor",
        },
        maxDonorCapacity: {
            type: Number,
            required: true,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
        },
        targetTotalBlood: {
            type: Number,
            required: true,
        },
        availableStaffCount: {
            type: Number,
            required: true,
        },
        availableBedCount: {
            type: Number,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
            },
            coordinates: {
                type: [Number],
            },
        },
        paymentType: {
            type: String,
            enum: ["cash", "giftCard","coupon"],
        },
        paymentAmount: {
            type: Number,
        },
        donorsRegisterd: {
            type: [Schema.Types.ObjectId],
            ref: "Individual",
            default: [],
        },
        donorsAttended: {
            type: [Schema.Types.ObjectId],
            ref: "Individual",
            default: [],
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Event = mongoose.model("Event", eventSchema);
