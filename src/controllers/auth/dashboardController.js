import { Doctor } from "../../models/users/doctor.model.js";
import { Organization } from "../../models/users/organization.model.js";
import { Individual } from "../../models/users/individual.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Event } from "../../models/event.model.js";
import { or } from "firebase/firestore/lite";

export const individualDashboardController = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        // Assuming `userId` is the ObjectId of the user you want to populate
        // .populate("receivedAlerts") // Populate receivedAlerts field with Alert documents
        // .populate("bloodReports") // Populate bloodReports field with BloodReport documents
        const user = await Individual.findById(userId).select("-password -refreshToken -__v -currentLocation")
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
            console.log(req.user);
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
            })


            console.log(upcomingEvents);
            const organizationDashboardData = organization.toObject();
            organizationDashboardData.upcomingEvents = upcomingEvents;

            return res.status(200).json(new ApiResponse(200, organizationDashboardData,"Organization dashboard"));
        } catch (error) {
            console.log(error);
            res.status(error?.statusCode || 500).json({
                message: error?.message || "Internal Server Error",
            });
        }
    }
);

export const doctorDashboardController = asyncHandler(
    async (req, res) => {
        try {
            const userId = req.user?._id;
            const doctor = await Doctor.findById(userId)
                // .populate("events")
                // .populate("events.doctors")
                // .populate("events.donorsRegisterd")
                // .populate("events.donorsAttended");
            return res.status(200).json(new ApiResponse(200, doctor,"Doctor dashboard"));
        } catch (error) {
            console.log(error);
            res.status(error?.statusCode || 500).json({
                message: error?.message || "Internal Server Error",
            });
        }
    }
);