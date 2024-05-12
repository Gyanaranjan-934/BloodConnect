import { Event } from "../../models/event.model";
import { Individual } from "../../models/users/individual.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const searchUser = asyncHandler(async (req, res) => {
    try {
        const { searchQuery, eventId } = req.body;

        // Regular expression for case-insensitive search
        const regex = new RegExp(searchQuery, "i");

        // Search for user
        const user = await Individual.findOne({
            $or: [
                { fullName: regex },
                { adhaarNo: regex },
                { phoneNo: regex },
                { email: regex }
            ]
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.status(201).json(new ApiResponse(201,user,"User fetched successfully"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            success: false,
            message: error?.message || "Internal Server Error"
        });
    }
});
