import { Event } from "../../models/event.model";
import { Organization } from "../../models/users/organization.model";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { logger } from "../../index.js";

export const updateEvent = asyncHandler(async (req, res) => {
    try {
        const { name, doctors, staffCount, bedCount, maxCapacity, time, date, isPaid } =
            req.body;
        if (
            [name, doctors, staffCount, bedCount, maxCapacity].some(
                (item) =>
                    typeof item === "string"
                        ? item?.trim() === ""
                        : typeof item === "number"
                          ? item > 0
                          : false
            )
        ) {
            throw new ApiError(400, "Please fill all the required details");
        }

        if(!time || !date){
            throw new ApiError(400, "Time and date of the event is required");
        }

        // check for the organization ID

        const requestedOrganizationID = req.user?._id;

        const actualOrganization = Organization.findById(requestedOrganizationID);

        if(!actualOrganization){
            throw new ApiError(400,"Organization does not exist");
        }

        const eventUpdated = await Event.findByIdAndDelete(requestedOrganizationID,{
            name,
            organizationId:requestedOrganizationID,
            doctors,
            staffCount,
            bedCount,
            maxCapacity,
            isPaid,
            dateOfEvent:date,
            timeOfEvent: time
        })

        if(!eventUpdated){
            throw new ApiError(500,"Error in updating new event. Please try again after some time...")
        }

        return res.status(201).json(new ApiResponse(201, eventUpdated, "Event updated successfully"));

    } catch (error) {
        logger.error(`Error in updating event: ${error}`);
        res.status(error?.statusCode || 500).json({
            mesage: error?.message || "Internal Server Error"
        })
    }
});

