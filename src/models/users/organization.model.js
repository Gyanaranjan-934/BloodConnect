import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { or } from "firebase/firestore";

const organizationSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        organizationHeadName: {
            type: String,
            required: true,
            trim: true,
        },
        organizationHeadAdhaar: {
            type: String,
            required: true,
            trim: true,
            length: 12,
            unique: true,
        },
        address: {
            type: {
                street: String,
                city: String,
                state: String,
                pincode: String,
            },
            _id: false,
            required: true,
        },
        appointments: {
            type: [Schema.Types.ObjectId],
            ref: "Appointment",
            default: [],
        },
        events:{
            type: [Schema.Types.ObjectId],
            ref: "Event",
            default:[]
        },
        typeOfOrganization:{
            type: String,
            enum: ['Healthcare', 'Educational', 'Charity','Other'],
            required: true
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        cinNo: {
            type: String,
            required: true,
            index: true,
            unique: true,
            trim: true,
        },
        isVerified: {
            type: Boolean,
            default: false
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
        photos:{
            type: [String],
            validate: {
                validator: function(v) {
                    return v.length <= 3;
                },
                message: props => `Photos array exceeds the maximum length of 3.`,
            },
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

organizationSchema.index({ currentLocation: "2dsphere" });

organizationSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

organizationSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

organizationSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            organizationName: this.organizationName,
            cinNo: this.cinNo,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

organizationSchema.methods.generateRefreshToken = function () {
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

export const Organization = mongoose.model("Organization", organizationSchema);
