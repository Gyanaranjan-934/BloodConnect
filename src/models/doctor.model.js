import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const doctorSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        doctorId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        gender: {
            type: String,
            enum: ["Male","Female","Others"],
        },
        dateOfBirth:{
            type: Date,
            required: true
        },
        avatar: {
            type: String,
            required: true,
        },
        phoneNo:{
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        }
    },
    {
        timestamps: true
    }
)

export const Event = mongoose.model("Event", doctorSchema);