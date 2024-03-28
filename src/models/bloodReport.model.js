import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const bloodReport = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "Individual",
        },
        bloodPressure:{
            type: Number,
        },
        sugarLevel:{
            type: Number
        },
        hemoglobinCount:{
            type: Number
        },
        bloodGroup:{
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        },
        heartRateCount:{
            type: Number
        }
    },
    {
        timestamps: true
    }
)

export const BloodReport = mongoose.model("BloodReport", bloodReport);