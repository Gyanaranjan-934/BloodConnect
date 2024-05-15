import { Individual } from "../../models/users/individual.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { logger } from "../../index.js";

export const getBloodReports = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        const bloodReports = await Individual.findById(userId)
            .populate({
                path: "bloodReports",
                model: "BloodReport",
            })
            .select("bloodReports");
        
        if(!bloodReports){
            throw new ApiError(404, "Blood reports not found");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    bloodReports.bloodReports,
                    "Blood reports fetched successfully"
                )
            );
    } catch (error) {
        logger.error(`Error in getting blood reports: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
