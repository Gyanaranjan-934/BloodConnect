import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { doc } from 'firebase/firestore'

const doctorSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        doctorId: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        gender: {
            type: String,
            enum: ["Male","Female","Others"],
        },
        dateOfBirth:{
            type: String,
        },
        avatar: {
            type: String,
        },
        phone:{
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        attendedCamps:{
            type: [Schema.Types.ObjectId],
            ref:"Event",
            default:[]
        },
        isVerified:{
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

doctorSchema.index({ currentLocation: "2dsphere" });

doctorSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

doctorSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

doctorSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

doctorSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};


export const Doctor = mongoose.model("Doctor", doctorSchema);