import { Doctor } from "../../models/users/doctor.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { logger } from "../../index.js";

export const searchDoctor = asyncHandler(async (req, res) => {
    try {
        const { query } = req.query;
        const doctors = await Doctor.find({
            $or: [
                { fullName: { $regex: new RegExp(query, "i") } }, // Search by name
                { email: { $regex: new RegExp(query, "i") } }, // Search by email
                { doctorId: { $regex: new RegExp(query, "i") } }, // Search by doctorID
                { phoneNo: { $regex: new RegExp(query, "i") } }, // Search by phone number
            ],
        });
        return res
            .status(200)
            .json(new ApiResponse(200, doctors, "Doctors found"));
    } catch (error) {
        logger.error(`Error in searching doctors: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const getDoctors = asyncHandler(async (req, res) => {
    try {
        const doctors = await Doctor.find().select("-password -refreshToken -_v");
        return res
            .status(200)
            .json(new ApiResponse(200, doctors, "Doctors found"));
    } catch (error) {
        logger.error(`Error in getting doctors: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
