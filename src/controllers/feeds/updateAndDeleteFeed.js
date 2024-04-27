import { Post } from "../../models/post.model";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";

export const updateFeed = asyncHandler(async (req, res) => {
    try {
        const { feedId, postHeader, postBody, userLocation } = req.body;

        const post = await Post.findById(feedId);
        if (!post || post.userId !== req.user._id) {
            throw new ApiError(
                401,
                "Either you are not the owner of the post or the post does not exist"
            );
        }

        const currentLocation = JSON.parse(userLocation);

        post.title = postHeader;
        post.description = postBody;
        post.location = {
            type: "Point",
            coordinates: [currentLocation.longitude, currentLocation.latitude],
        };

        const postFiles = req.files;

        let newImageUrls = [];
        if (postFiles.length > 0) {
            let oldImageUrls = product.files;

            for (let index = 0; index < oldImageUrls.length; index++) {
                const url = oldImageUrls[index];
                await deleteOnCloudinary(url);
            }
            for (let i = 0; i < postFiles.length; i++) {
                const imageLocalPath = postFiles[i].path;

                const imageCloudinaryUrl =
                    await uploadOnCloudinary(imageLocalPath);
                if (imageCloudinaryUrl) {
                    newImageUrls.push(imageCloudinaryUrl.url);
                }
            }
        }
        post.files = newImageUrls;
        const updatedPost = await post.save();

        return res
            .status(200)
            .json(
                new ApiResponse(200, updatedPost, "Post updated successfully")
            );
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});


export const deleteFeed = asyncHandler(async (req, res) => {
    try {
        const { feedId } = req.body;
        const post = await Post.findById(feedId);
        if (!post || post.userId !== req.user._id) {
            throw new ApiError(
                401,
                "Either you are not the owner of the post or the post does not exist"
            );
        }

        for(let i = 0; i < post.files.length; i++){
            const url = post.files[i];
            await deleteOnCloudinary(url);
        }

        await post.delete();

        return res.status(200).json(new ApiResponse(200, {}, "Post deleted successfully"));

    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});