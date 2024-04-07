import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const indivdualUserSchema = new Schema(
    {
        bloodGroup: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        adhaarNo: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Others"],
        },
        dateOfBirth: {
            type: String,
        },
        permanentAddress: {
            type: {
                street: String,
                city: String,
                state: String,
                pincode: Number,
            },
        },
        presentAddress: {
            type: {
                street: String,
                city: String,
                state: String,
                pincode: Number,
            },
        },
        currentLocation: {
            type: [Number],
        },
        phoneNo: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        },
        receivedAlerts: {
            type: [Schema.Types.ObjectId],
            ref: "Alert",
        },
        bloodReports: {
            type: [Schema.Types.ObjectId],
            ref: "BloodReport",
        },
        eventsRegistered: {
            type: [Schema.Types.ObjectId],
            ref: "Event",
            default: [],
        },
        eventsAttended: {
            type: [
                {
                    eventId: {
                        type: Schema.Types.ObjectId,
                        ref: "Event",
                    },
                    doctorId: {
                        type: Schema.Types.ObjectId,
                        ref: "Event",
                    },
                },
            ],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

indivdualUserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

indivdualUserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

indivdualUserSchema.methods.generateAccessToken = function () {
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

indivdualUserSchema.methods.generateRefreshToken = function () {
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

export const Individual = mongoose.model("Individual", indivdualUserSchema);
