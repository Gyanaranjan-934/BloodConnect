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
            trim: true,
            required: true,
        },
        avatar: {
            type: String,
            default: "",
        },
        adhaarNo: {
            type: String,
            trim: true,
            default: "",
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Others"],
        },
        dateOfBirth: {
            type: String,
            default: "",
        },
        permanentAddress: {
            type: {
                street: String,
                city: String,
                state: String,
                pincode: String,
            },
            _id: false,
            default: {
                street: "",
                city: "",
                state: "",
                pincode: "",
            },
        },
        presentAddress: {
            type: {
                street: String,
                city: String,
                state: String,
                pincode: String,
            },
            _id: false,
            default: {
                street: "",
                city: "",
                state: "",
                pincode: "",
            },
        },
        currentLocation: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        phone: {
            type: String,
            trim: true,
            default: "",
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
            default: [],
        },
        bloodReports: {
            type: [Schema.Types.ObjectId],
            ref: "BloodReport",
            default: [],
        },
        eventsRegistered: {
            type: [Schema.Types.ObjectId],
            ref: "Event",
            default: [],
        },
        appointments: {
            type: [Schema.Types.ObjectId],
            ref: "Appointment",
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
                    donationDate: Date,
                    bloodUnits: Number,
                },
            ],
            _id: false,
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
