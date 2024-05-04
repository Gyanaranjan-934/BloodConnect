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
        name: {
            type: String,
            required: true,
            trim: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        adhaarNo: {
            type: String,
            required: true,
            unique: true,
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
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
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

indivdualUserSchema.index({ currentLocation: "2dsphere" });

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
