import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema(
    {
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization"
        },
        reviewHeader: {
            type: String,
        },
        reviewDescrption:{
            type: String
        },
        photos:{
            type: [String],
            validate: {
                validator: function(v) {
                    return v.length <= 3;
                },
                message: props => "Maximum 3 photos can be sent to server",
            },
        },
        rating: {
            type: Number,
        },
        isVerified:{
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
)

export const Feedback = mongoose.model('Feedback',feedbackSchema);