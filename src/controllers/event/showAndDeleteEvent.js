import { Event } from "../../models/event.model.js";
import { Organization } from "../../models/users/organization.model.js";
import { Individual } from "../../models/users/individual.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { logger } from "../../index.js";

export const getAllEvents = asyncHandler(async (req, res) => {
    try {
        // Fetch all events
        const userId = req.user?._id;

        // Fetch user details with eventsAttended populated
        const userWithEvents = await User.findById(userId).populate({
            path: "eventsAttended.eventId", // Populate the eventId field with Event documents
            model: "Event", // Specify the model to use for populating
        });

        // Extract only the event details from the populated userWithEvents
        const eventsAttendedDetails = userWithEvents.eventsAttended.map(
            (event) => event.eventId
        );

        // Return success response with events
        res.status(200).json(
            new ApiResponse(
                200,
                eventsAttendedDetails,
                "All events fetched successfully"
            )
        );
    } catch (error) {
        logger.error(`Error in getting all events: ${error}`);
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

export const getEventDetails = asyncHandler(async (req, res) => {
    try {
        const eventId = req.query.eventId;
        // Fetch event details by eventId
        const event = await Event.findById(eventId)
            .populate({
                path: "organizationId",
                model: "Organization",
                select: "_id email organizationHeadName organizationHeadAdhaar cinNo name phone typeOfOrganization",
            })
            .populate({
                path: "doctors",
                model: "Doctor",
                select: "_id avatar doctorId email name gender phone",
            })
            .populate({
                path: "donorsRegisteredBySelf",
                model: "Individual",
                select: "_id avatar bloodGroup bloodReports adhaarNo dateOfBirth email name phone",
            })
            .populate({
                path: "donorsRegisteredByDoctor",
                model: "Individual",
                select: "_id avatar bloodGroup bloodReports dateOfBirth email name phone",
            })
            .populate({
                path: "donorsAttended.donorId",
                model: "Individual",
                select: "_id avatar bloodGroup bloodReports adhaarNo dateOfBirth email name phone",
            })
            .populate({
                path: "donorsAttended.doctorId",
                model: "Doctor",
                select: "_id avatar doctorId email name gender phone",
            });

        // If event not found, throw error
        if (!event) {
            throw new ApiError(404, "Event not found");
        }

        const userType = req.userType;
        if (userType === "doctor") {
            const donorsRegisteredButNotAttended = event.donorsRegisteredBySelf
                .filter((donor) => {
                    return !event.donorsAttended.some((attendedDonor) => {
                        return attendedDonor.donorId._id.equals(donor._id);
                    });
                })
                .map((donor) => donor.toObject());
            event.toObject().donorsRegisteredBySelf =
                donorsRegisteredButNotAttended;
        }
        // Return success response with event details
        res.status(200).json(
            new ApiResponse(200, event, "Event details fetched successfully")
        );
    } catch (error) {
        logger.error(`Error in getting event details: ${error}`);
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

export const deleteEvent = asyncHandler(async (req, res) => {
    try {
        const { eventId } = req.body;
        const organizationId = req.user?._id;

        const organization = await Organization.findById(organizationId);
        if (!organization) {
            throw new ApiError(400, "This organization does not exist");
        }

        // Find event and check ownership
        const event = await Event.findById(eventId);
        if (!event || event.organizationId.toString() !== organizationId) {
            throw new ApiError(
                400,
                "This event does not exist or it is not created by your organization"
            );
        }

        // Delete the event
        await event.delete();

        // Return success response
        res.status(200).json(
            new ApiResponse(200, {}, "Event deleted successfully")
        );
    } catch (error) {
        logger.error(`Error in deleting event: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const getAllUpcomingEventsForIndividual = asyncHandler(
    async (req, res) => {
        try {
            const userId = req.user?._id;
            const currentDate = new Date();
            const currentDateWithoutTime = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate()
            );

            let events = await Event.find({
                isVerified: true,
                $or: [
                    // Events starting on or after the current date
                    { startDate: { $gte: currentDateWithoutTime } },
                    // Events ending after the current date
                    { endDate: { $gte: currentDateWithoutTime } },
                    // Events that started before today and end after today (events currently in progress)
                    {
                        startDate: { $lt: currentDateWithoutTime },
                        endDate: { $gte: currentDateWithoutTime },
                    },
                ],
            }).sort({ dateOfEvent: -1 });

            const registeredEvents = await Individual.findById(userId).select(
                "eventsRegistered eventsAttended"
            );

            if (registeredEvents) {
                events = events.filter((event) => {
                    return !(
                        registeredEvents.eventsRegistered.includes(event._id) ||
                        registeredEvents.eventsAttended.includes(event._id)
                    );
                });
            }

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        events,
                        "Upcoming events fetched successfully"
                    )
                );
        } catch (error) {
            logger.error(
                `Error in getting upcoming events for individual: ${error}`
            );
            res.status(error?.statusCode || 500).json({
                message: error?.message || "Internal Server Error",
            });
        }
    }
);

export const getAllEventsForOrganization = asyncHandler(async (req, res) => {
    try {
        const events = await Event.find({
            organizationId: req.user._id,
        }).populate("doctors").sort({ dateOfEvent: -1 });
        return res
            .status(200)
            .json(new ApiResponse(200, events, "Events fetched successfully"));
    } catch (error) {
        logger.error(`Error in getting all events for organization: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const getRegisteredEventsOfIndividual = asyncHandler(
    async (req, res) => {
        try {
            const registeredEvents = await Individual.findById(req.user._id)
                .populate(
                    "eventsRegistered",
                    "_id eventName isPaid startDate endDate startTime endTime address location paymentType paymentAmount"
                )
                .populate("eventsRegistered.organizationId", "name cinNo")
                .populate(
                    "eventsAttended.eventId",
                    "eventName isPaid startDate endDate startTime endTime address location paymentType paymentAmount"
                )
                .select("eventsRegistered eventsAttended")
                .lean();

            let eventsData = [];

            if (registeredEvents) {
                eventsData = registeredEvents.eventsRegistered.map((event) => {
                    // Add isAttended field
                    event.isAttended = registeredEvents.eventsAttended.some(
                        (attendedEvent) => attendedEvent.eventId._id.equals(event._id)
                    );
                    return event;
                });
            }

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        eventsData,
                        "Registered events fetched successfully"
                    )
                );
        } catch (error) {
            logger.error(
                `Error in getting registered events for individual: ${error}`
            );
            res.status(error?.statusCode || 500).json({
                message: error?.message || "Internal Server Error",
            });
        }
    }
);

export const getEventsForDoctor = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const events = await Event.find({
            doctors: {
                $elemMatch: {
                    $eq: userId,
                },
            },
        })

            .sort({ dateOfEvent: -1 });
        return res
            .status(200)
            .json(new ApiResponse(200, events, "Events fetched successfully"));
    } catch (error) {
        logger.error(`Error in getting events for doctor: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const getDonorsRegisteredByDoctor = asyncHandler(async (req, res) => {
    try {
        const doctorId = req.user._id;
        const eventId = req.query.eventId;
        const donorsRegistered = await Event.findById(eventId)
            .select("donorsRegisteredByDoctor")
            .populate({
                path: "donorsRegisteredByDoctor.user",
                model: "User",
            });
        const donorsRegisteredByCurrentDoctor =
            donorsRegistered.donorsRegisteredByDoctor.filter((donor) =>
                donor.doctor.equals(doctorId)
            );
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    donorsRegisteredByCurrentDoctor,
                    "Donors registered fetched successfully"
                )
            );
    } catch (error) {
        logger.error(`Error in getting donors registered by doctor: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const getDonorsAttendedByDoctor = asyncHandler(async (req, res) => {
    try {
        const doctorId = req.user._id;
        const eventId = req.query.eventId;

        const event = await Event.findById(eventId)
            .populate({
                path: "donorsAttended.donorId",
                model: "Individual",
                select: "_id avatar bloodGroup eventsAttended dateOfBirth email name phone",
            })
            .populate({
                path: "donorsAttended.doctorId",
                model: "Doctor",
                select: "_id avatar doctorId email name gender phone",
            });

        // Filter donors attended by the current doctor
        const donorsAttended = event.donorsAttended.filter((donor) => {
            return donor.doctorId.equals(doctorId);
        });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    donorsAttended,
                    "Donors attended fetched successfully"
                )
            );
    } catch (error) {
        logger.error(`Error in getting donors attended by doctor: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
