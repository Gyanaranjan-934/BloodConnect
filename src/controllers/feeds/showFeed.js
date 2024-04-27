import { Post } from "../../models/post.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const showFeeds = asyncHandler(async (req, res) => {
    try {
        const post = await Post.find();
        if (!post) {
            throw new ApiError(404, "Posts not found");
        }

        return res.status(200).json(new ApiResponse(200, post, "Post found"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});