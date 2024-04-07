import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const bloodReport = new Schema(
    {
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
        },
        updatedBy:{
            type: Schema.Types.ObjectId,
            ref:"Doctor"
        },
        lastCamp:{
            type: Schema.Types.ObjectId,
            ref:"Event"   
        }
    },
    {
        timestamps: true
    }
)

export const BloodReport = mongoose.model("BloodReport", bloodReport);