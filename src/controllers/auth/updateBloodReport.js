import { BloodReport } from "../../models/bloodReport.model";
import { Event } from "../../models/event.model";
import { Individual } from "../../models/users/user.model";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

export const updateReport = asyncHandler(async (req, res) => {
    try {
        const { eventId, userId, bloodDetails } = req.body;

        // Validate input parameters
        if (!eventId || !userId || !bloodDetails) {
            throw new ApiError(400, "eventId, userId, and bloodDetails are required.");
        }

        const doctorId = req.user?._id;

        // Parse bloodDetails if needed
        const bloodReport = typeof bloodDetails === "string" ? JSON.parse(bloodDetails) : bloodDetails;

        // Find user
        const user = await Individual.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found.");
        }

        // Create blood report
        const createdBloodReport = await BloodReport.create({
            userId,
            bloodPressure: bloodReport.bloodPressure,
            sugarLevel: bloodReport.sugarLevel,
            hemoglobinCount: bloodReport.hemoglobinCount,
            bloodGroup: user.bloodGroup,
            heartRateCount: user.heartRateCount,
            updatedBy: doctorId,
            lastCamp: eventId,
        });

        // Update user's blood reports and events attended
        user.bloodReports.push(createdBloodReport._id);
        user.eventsAttended.push({ eventId, doctorId });
        await user.save();

        // Update event
        const event = await Event.findById(eventId);
        if (!event) {
            throw new ApiError(404, "Event not found.");
        }
        event.donorsAttended.push(userId);
        await event.save();

        return res.status(201).json(new ApiResponse(201, { bloodReportId: createdBloodReport._id }, "Blood report updated successfully"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
