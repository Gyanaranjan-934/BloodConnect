import { BloodReport } from "../../models/bloodReport.model";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const createBloodReport = asyncHandler(async (req, res) => {
    try {
        const { bloodGroup,  heartRateCount, sugarLevel, hemoglobinCount, bloodPressure } = req.body;

        const bloodReport = await BloodReport.create({
            userId: req.user._id,
            bloodGroup,
            bloodPressure,
            heartRateCount,
            sugarLevel,
            hemoglobinCount,
        });

        return res.status(201).json(new ApiResponse(201, bloodReport, "Blood report created successfully"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});