import { Event } from "../../models/event.model";
import { Organization } from "../../models/users/organization.model";
import { Individual } from "../../models/users/user.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const getAllEvents = asyncHandler(async (req, res) => {
    try {
        // Fetch all events
        const userId = req.user?._id;

        // Fetch user details with eventsAttended populated
        const userWithEvents = await User.findById(userId).populate({
            path: 'eventsAttended.eventId', // Populate the eventId field with Event documents
            model: 'Event' // Specify the model to use for populating
        });

        // Extract only the event details from the populated userWithEvents
        const eventsAttendedDetails = userWithEvents.eventsAttended.map(event => event.eventId);

        // Return success response with events
        res.status(200).json(new ApiResponse(200, eventsAttendedDetails, "All events fetched successfully"));
    } catch (error) {
        // Catch and handle errors
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

export const getEventDetails = asyncHandler(async (req, res) => {
    try {
        const eventId = req.params.eventId;

        // Fetch event details by eventId
        const event = await Event.findById(eventId);

        // If event not found, throw error
        if (!event) {
            throw new ApiError(404, "Event not found");
        }

        // Return success response with event details
        res.status(200).json(new ApiResponse(200, event, "Event details fetched successfully"));
    } catch (error) {
        // Catch and handle errors
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

        // Check if organization exists
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            throw new ApiError(400, "This organization does not exist");
        }

        // Find event and check ownership
        const event = await Event.findById(eventId);
        if (!event || event.organizationId.toString() !== organizationId) {
            throw new ApiError(400, "This event does not exist or it is not created by your organization");
        }

        // Delete the event
        await event.delete();

        // Return success response
        res.status(200).json(new ApiResponse(200, {}, "Event deleted successfully"));
    } catch (error) {
        // Catch and handle errors
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error"
        });
    }
});
