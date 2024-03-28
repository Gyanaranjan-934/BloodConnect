import mongoose, { Schema } from "mongoose";

const PaymentSchema = new Schema(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        senderType: {
            type: String,
            required: true,
            enum: ["Organization", "Individual"],
        },
        amount: {
            type: Number,
            required: true,
        },
        paymentDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export const Payment = mongoose.model("Payment", PaymentSchema);