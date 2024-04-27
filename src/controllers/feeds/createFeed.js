import { Post } from "../../models/post.model";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

export const createFeed = asyncHandler(async (req, res) => {
    try {
        const { postHeader, postBody, userLocation } = req.body;
        const userType = req.userType;
        const feedType = userType === "individual" ? "Individual" : "organization" ? "Organization": "Admin";

        const postFiles = req.files;

        const filesURLs = [];
        for (let i = 0; i < postFiles.length; i++) {
            let imageLocalPath = postFiles[i]?.path;

            if (imageLocalPath) {
                const imageCloudinaryUrl = await uploadOnCloudinary(imageLocalPath);
                if (imageCloudinaryUrl) {
                    filesURLs.push(imageCloudinaryUrl.url);
                }
            }
        }

        const currentLocation = JSON.parse(userLocation);
        
        const feed = await Post.create({
            userId: req.user._id,
            userType: feedType,
            title: postHeader,
            description: postBody,
            files: filesURLs,
            location: {
                type: "Point",
                coordinates: [currentLocation.longitude, currentLocation.latitude],
            }
        });
        return res.status(201).json(new ApiResponse(201, feed, "Feed created successfully"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});