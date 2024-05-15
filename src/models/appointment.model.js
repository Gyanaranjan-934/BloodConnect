import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "Individual",
        required: true,
    },
    appointmentDate: {
        type: Date,
        required: true,
    },
    appointmentTime: {
        type: String,
        required: true,
    },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
    },
    status:{
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending",
    }
})

export const Appointment = mongoose.model("Appointment", appointmentSchema);