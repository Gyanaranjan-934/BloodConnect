import { Organization } from "../../models/users/organization.model.js";
import { Individual } from "../../models/users/user.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const individualDashboardController = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        // Assuming `userId` is the ObjectId of the user you want to populate
        // .populate("receivedAlerts") // Populate receivedAlerts field with Alert documents
        // .populate("bloodReports") // Populate bloodReports field with BloodReport documents
        const user = await Individual.findById(userId)
            // .populate("eventsRegistered") // Populate eventsRegistered field with Event documents
            // .populate({
            //     path: "eventsAttended.eventId", // Populate eventId field within eventsAttended array with Event documents
            //     model: "Event",
            // })
            // .populate({
            //     path: "eventsAttended.doctorId", // Populate doctorId field within eventsAttended array with Event documents
            //     model: "Event",
            // });
        // console.log(user);
        return res
            .status(200)
            .json(new ApiResponse(200, user, "User dashboard"));
    } catch (error) {
        console.log(error);
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
                // .populate("events")
                // .populate("events.doctors")
                // .populate("events.donorsRegisterd")
                // .populate("events.donorsAttended");
            return res.status(200).json(new ApiResponse(200, organization,"Organization dashboard"));
        } catch (error) {
            console.log(error);
            res.status(error?.statusCode || 500).json({
                message: error?.message || "Internal Server Error",
            });
        }
    }
);

