import { Doctor } from "../../models/users/doctor.model.js";
import { Organization } from "../../models/users/organization.model.js";
import { Individual } from "../../models/users/individual.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Event } from "../../models/event.model.js";
import { logger } from "../../index.js";

export const individualDashboardController = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        const user = await Individual.findById(userId)
            .populate("appointments")
            .select("-password -refreshToken -__v -currentLocation");
        return res
            .status(200)
            .json(new ApiResponse(200, user, "User dashboard"));
    } catch (error) {
        logger.error(`Error in getting individual dashboard: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const organizationDashboardController = asyncHandler(
    async (req, res) => {
        try {
            const userId = req.user?._id;
            
            const organization = await Organization.findById(userId)
                .populate("events")
                .populate("events.doctors")
                .populate("events.donorsRegisterd")
                .populate("events.donorsAttended");

            // get the all the upcoming events
            const upcomingEvents = await Event.find({
                organizationId: organization._id,
                startDate: {
                    $gte: new Date(),
                },
            });

            
            const organizationDashboardData = organization.toObject();
            
            organizationDashboardData.upcomingEvents = upcomingEvents;

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        organizationDashboardData,
                        "Organization dashboard"
                    )
                );
        } catch (error) {
            logger.error(`Error in getting organization dashboard: ${error}`);
            res.status(error?.statusCode || 500).json({
                message: error?.message || "Internal Server Error",
            });
        }
    }
);

export const doctorDashboardController = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        
        const doctor = await Doctor.findById(userId);
        
        return res
            .status(200)
            .json(new ApiResponse(200, doctor, "Doctor dashboard"));
    } catch (error) {
        logger.error(`Error in getting doctor dashboard: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
