import { BloodReport } from "../../models/bloodReport.model.js";
import { Event } from "../../models/event.model.js";
import { Individual } from "../../models/users/individual.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { logger } from "../../index.js";

export const updateReport = asyncHandler(async (req, res) => {
    try {
        const { eventId, userId, bloodDetails } = req.body;

        if (!eventId || !userId || !bloodDetails) {
            throw new ApiError(400, "eventId, userId, and bloodDetails are required.");
        }

        const doctorId = req.user?._id;

        const bloodReport = typeof bloodDetails === "string" ? JSON.parse(bloodDetails) : bloodDetails;

        const user = await Individual.findById(userId).populate("bloodReports");

        if (!user) {
            throw new ApiError(404, "User not found.");
        }

        const updatedReport = await BloodReport.findByIdAndUpdate(userId,{
            userId,
            bloodPressure: bloodReport.bloodPressure,
            sugarLevel: bloodReport.sugarLevel,
            hemoglobinCount: bloodReport.hemoglobinCount,
            bloodGroup: user.bloodGroup,
            heartRateCount: user.heartRateCount,
            updatedBy: doctorId,
            lastCamp: eventId,
        });

        user.bloodReports.push(updatedReport._id);

        user.eventsAttended.push({ eventId, doctorId });

        await user.save();

        const event = await Event.findById(eventId);

        if (!event) {
            throw new ApiError(404, "Event not found.");
        }

        event.donorsAttended.push(userId);

        await event.save();

        return res.status(201).json(new ApiResponse(201, { bloodReportId: updatedReport._id }, "Blood report updated successfully"));
    } catch (error) {
        logger.error(`Error in updating blood report: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
