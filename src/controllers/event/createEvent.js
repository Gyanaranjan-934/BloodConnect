import { Event } from "../../models/event.model.js";
import { Doctor } from "../../models/users/doctor.model.js";
import { Organization } from "../../models/users/organization.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const createEvent = asyncHandler(async (req, res) => {
    try {
        console.log(req.body);
        const { eventDetails } = req.body;
        const {
            eventName,
            eventHeadName,
            startDate,
            endDate,
            startTime,
            endTime,
            isPaid,
            paymentType,
            paymentAmount,
            targetTotalBlood,
            maxDonorCapacity,
            availableStaffCount,
            availableBedCount,
            doctorsList,
            address,
            location,
        } = JSON.parse(eventDetails);
        console.log(JSON.parse(eventDetails));
        // Validation: Check if required fields are filled
        if (
            !eventName ||
            !eventHeadName ||
            !startDate ||
            !endDate ||
            !startTime ||
            !endTime ||
            !targetTotalBlood ||
            !maxDonorCapacity ||
            !availableStaffCount ||
            !availableBedCount ||
            !doctorsList ||
            !address ||
            !location
        ) {
            throw new ApiError(400, "Please fill all the required details");
        }
        if (isPaid) {
            if (paymentType === "cash" && !paymentAmount) {
                throw new ApiError(400, "Payment type and amount are required");
            }
        }
        const [startYear, startMonth, startDay] = startDate
            .split("-")
            .map(Number);

        // Parse the time string to extract hours and minutes
        const [startHours, startMinutes] = startTime.split(":").map(Number);

        // Create a new Date object using the parsed components
        const startDateCoverted = new Date(
            startYear,
            startMonth - 1,
            startDay,
            startHours,
            startMinutes
        );

        const [endYear, endMonth, endDay] = endDate.split("-").map(Number);

        // Parse the time string to extract hours and minutes
        const [endHours, endMinutes] = endTime.split(":").map(Number);

        // Create a new Date object using the parsed components
        const endDateCoverted = new Date(
            endYear,
            endMonth - 1,
            endDay,
            endHours,
            endMinutes
        );

        // Validation: Check if time and date of the event are provided
        if (new Date(startDate) > new Date(endDate)) {
            throw new ApiError(400, "Start date should be less than end date");
        }

        if (new Date(startTime) > new Date(endTime)) {
            throw new ApiError(400, "Start time should be less than end time");
        }

        const doctorsFromDB = await Doctor.find({ _id: { $in: doctorsList } });

        if (doctorsFromDB.length !== doctorsList.length) {
            throw new ApiError(
                400,
                "Some of the doctors are not are not in the application"
            );
        }

        // Check for the organization ID
        const requestedOrganizationID = req.user?._id;
        const actualOrganization = await Organization.findById(
            requestedOrganizationID
        );

        // If organization doesn't exist, throw error
        if (!actualOrganization) {
            throw new ApiError(400, "Organization does not exist");
        }

        let currentLocationCoord = {
            latitude: 0.0,
            longitude: 0.0,
        };
        if (location) {
            currentLocationCoord = location;
        }

        // Create event
        const eventCreated = await Event.create({
            eventName,
            eventHeadName,
            startDate: startDateCoverted,
            endDate: endDateCoverted,
            startTime,
            endTime,
            targetTotalBlood,
            availableStaffCount,
            availableBedCount,
            address,
            location,
            paymentType,
            maxDonorCapacity,
            paymentAmount,
            location: {
                type: "Point",
                coordinates: [
                    parseFloat(String(currentLocationCoord.longitude)),
                    parseFloat(String(currentLocationCoord.latitude)),
                ],
            },
            isPaid,
            organizationId: actualOrganization._id,
            doctors: doctorsFromDB.map((doctor) => doctor._id),
        });

        // If event creation failed, throw error
        if (!eventCreated) {
            throw new ApiError(
                500,
                "Error in creating new event. Please try again after some time..."
            );
        }

        // Return success response
        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    eventCreated,
                    "Event created successfully, but for now our team will verify the details provided by you and will send you an email to confirm the event"
                )
            );
    } catch (error) {
        // Catch and handle errors
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
