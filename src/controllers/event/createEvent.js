import { Event } from "../../models/event.model";
import { Doctor } from "../../models/users/doctor.model";
import { Organization } from "../../models/users/organization.model";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

export const createEvent = asyncHandler(async (req, res) => {
    try {
        // Destructure request body
        const { name, doctors, staffCount, bedCount, maxCapacity, time, date, isPaid } = req.body;
        
        // Validation: Check if required fields are filled
        if (![name, doctors, staffCount, bedCount, maxCapacity].every(item => typeof item === "string" ? item.trim() !== "" : typeof item === "number" ? item > 0 : false)) {
            throw new ApiError(400, "Please fill all the required details");
        }

        // Validation: Check if time and date of the event are provided
        if (!time || !date) {
            throw new ApiError(400, "Time and date of the event are required");
        }

        const doctorsFromDB = await Doctor.find({ _id: { $in: receiptantIds } });

        if(doctorsFromDB.length !== receiptantIds.length){
            throw new ApiError(400, "Some of the doctors are not are not in the application");
        }


        // Check for the organization ID
        const requestedOrganizationID = req.user?._id;
        const actualOrganization = await Organization.findById(requestedOrganizationID);

        // If organization doesn't exist, throw error
        if (!actualOrganization) {
            throw new ApiError(400, "Organization does not exist");
        }

        // Create event
        const eventCreated = await Event.create({
            name,
            organizationId: requestedOrganizationID,
            doctors: doctorsFromDB.map(doctor => doctor._id),
            staffCount,
            bedCount,
            maxCapacity,
            isPaid,
            dateOfEvent: date,
            timeOfEvent: time
        });

        // If event creation failed, throw error
        if (!eventCreated) {
            throw new ApiError(500, "Error in creating new event. Please try again after some time...");
        }

        // Return success response
        return res.status(201).json(new ApiResponse(201, eventCreated, "Event created successfully, but for now our team will verify the details provided by you and will send you an email to confirm the event"));
    } catch (error) {
        // Catch and handle errors
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});
