import { Event } from "../../models/event.model.js";
import { Individual } from "../../models/users/individual.model.js";
import { User } from "../../models/users/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { logger } from "../../index.js";

export const registerBySelf = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { eventId } = req.body;
    try {
        if (!eventId) {
            throw new ApiError(400, "Event ID is required");
        }

        const event = await Event.findById(eventId);
        if (!event) {
            throw new ApiError(404, "Event not found");
        }

        if (event.donorsRegisteredBySelf.includes(userId)) {
            throw new ApiError(
                400,
                "User is already registered for this event"
            );
        }

        const today = new Date().setHours(0, 0, 0, 0);

        const eventDate = new Date(event.dateOfEvent).setHours(0, 0, 0, 0);

        if (eventDate < today) {
            throw new ApiError(404, "Event has already finished");
        }

        event.donorsRegisteredBySelf.push(userId);

        await event.save();

        const user = await Individual.findByIdAndUpdate(userId, {
            $push: { eventsRegistered: eventId },
        });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "User registered successfully for the event"
                )
            );
    } catch (error) {
        logger.error(`Error in registering user for the event: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const registerByDoctor = asyncHandler(async (req, res) => {
    const doctorId = req.user?._id;
    const { email, name, phone, bloodGroup, eventId } = req.body;

    try {
        if (!eventId) {
            throw new ApiError(400, "Event ID is required");
        }

        const event = await Event.findById(eventId);
        if (!event) {
            throw new ApiError(404, "Event does not exist");
        }

        if (!event.doctors.includes(doctorId)) {
            throw new ApiError(400, "You are not associated with this event");
        }

        // Update user registration for the event
        const user = await User.create({
            name,
            email : email ? email : "",
            phone : phone ? phone : "",
            bloodGroup: bloodGroup ? bloodGroup : "",
            eventId: event._id,
        });
        event.donorsRegisteredByDoctor.push(user._id);
        await event.save();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    user,
                    "User registered successfully for the event"
                )
            );
    } catch (error) {
        logger.error(`Error in registering user for the event: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
