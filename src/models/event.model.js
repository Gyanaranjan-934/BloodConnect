import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const eventSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
        },
        doctors: {
            type: [Schema.Types.ObjectId],
            ref: "Doctor"
        },
        staffsCount: {
            type: Number,
            required: true,
        },
        bedCount:{
            type: Number,
            required: true
        },
        maxCapacity:{
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export const Event = mongoose.model("Event", eventSchema);