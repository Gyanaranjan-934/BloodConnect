import { Event } from "../../models/event.model.js";
import { Individual } from "../../models/users/individual.model.js";
import { User } from "../../models/users/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// If any user register for the event through the application
export const registerBySelf = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { eventId } = req.body;
    // console.log(eventId);
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
        if (event.donorsRegisteredBySelf.includes(userId)) {
            throw new ApiError(
                400,
                "User is already registered for this event"
            );
        }

        // Check event date
        const today = new Date().setHours(0, 0, 0, 0);
        const eventDate = new Date(event.dateOfEvent).setHours(0, 0, 0, 0);
        if (eventDate < today) {
            throw new ApiError(404, "Event has already finished");
        }

        // Update event and user
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
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

// If any user directly comes to the event page, they will be registered for the event by the doctor
export const registerByDoctor = asyncHandler(async (req, res) => {
    const doctorId = req.user?._id;
    const { email, name, phone, bloodGroup, eventId } = req.body;

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
        console.log(error);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
