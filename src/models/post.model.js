import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        userType: {
            type: String,
            required: true,
            enum: ["Organization", "Individual","Admin"]
        },
        title: {
            type: String,
            required: true,
        },
        description:{
            type: String
        },
        files:{
            type: [String],
            validate: {
                validator: function(v) {
                    return v.length > 0 && v.every(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif') || file.endsWith('.mp4') || file.endsWith('.mov'));
                },
                message: props => `Files must be either images (jpg, png, gif) or videos (mp4, mov)`,
            },   
        }
    },
    {
        timestamps: true,
    }
);

export const Post = mongoose.model("Post", postSchema);
