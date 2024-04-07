import { Event } from "../../models/event.model";
import { Individual } from "../../models/users/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const registerBySelf = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { eventId } = req.body;

    try {
        // Validation
        if (!eventId) {
            throw new ApiError(400, "Event ID is required");
        }

        const event = await Event.findById(eventId);
        if (!event) {
            throw new ApiError(404, "Event not found");
        }

        // Check if user is already registered
        if (event.donorsRegistered.includes(userId)) {
            throw new ApiError(400, "User is already registered for this event");
        }

        // Check event date
        const today = new Date().setHours(0, 0, 0, 0);
        const eventDate = new Date(event.dateOfEvent).setHours(0, 0, 0, 0);
        if (eventDate < today) {
            throw new ApiError(404, "Event has already finished");
        }

        // Update event and user
        event.donorsRegistered.push(userId);
        const user = await Individual.findByIdAndUpdate(userId, { $push: { eventsRegistered: eventId } });

        return res.status(200).json(new ApiResponse(200, {}, "User registered successfully for the event"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const registerByDoctor = asyncHandler(async (req, res) => {
    const doctorId = req.user?._id;
    const { userId, eventId } = req.body;

    try {
        // Validation
        if (!eventId) {
            throw new ApiError(400, "Event ID is required");
        }

        const event = await Event.findById(eventId);
        if (!event) {
            throw new ApiError(404, "Event does not exist");
        }

        // Check doctor association with the event
        if (!event.doctors.includes(doctorId)) {
            throw new ApiError(400, "You are not associated with this event");
        }

        const user = await Individual.findById(userId);
        if (!user) {
            throw new ApiError(404, "User does not exist");
        }

        // Update user registration for the event
        await Individual.findByIdAndUpdate(userId, { $push: { eventsRegistered: eventId } });
        event.donorsRegistered.push(userId);
        await event.save();

        return res.status(200).json(new ApiResponse(200, {}, "User registered successfully for the event"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
