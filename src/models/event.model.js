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
        staffCount: {
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
        },
        isPaid:{
            type: Boolean,
            default: false
        },
        dateOfEvent:{
            type: Date,
            required: true
        },
        timeOfEvent:{
            type: String,
            required: true
        },
        donorsRegisterd:{
            type: [Schema.Types.ObjectId],
            ref:"Individual",
            default: []
        },
        donorsAttended:{
            type: [Schema.Types.ObjectId],
            ref:"Individual",
            default: []
        }
    },
    {
        timestamps: true
    }
)

export const Event = mongoose.model("Event", eventSchema);