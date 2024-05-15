import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Individual } from "../../models/users/individual.model.js";
import {
    deleteOnCloudinary,
    uploadOnCloudinary,
} from "../../utils/cloudinary.js";
import { logger } from "../../index.js";

export const editIndividualAvatar = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await Individual.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        if (user.avatar) {
            await deleteOnCloudinary(user.avatar);
        }
        const avatarLocalPath = req.file?.path;

        const avatar = await uploadOnCloudinary(avatarLocalPath);

        if (!avatar) {
            throw new ApiError(
                400,
                "Failed to upload avatar, try again after some time"
            );
        }

        user.avatar = avatar.url;

        await user.save();

        return res
            .status(200)
            .json(new ApiResponse(200, user, "User updated successfully"));
    } catch (error) {
        logger.error(`Error in updating individual avatar: ${error}`);
        console.log(error);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
