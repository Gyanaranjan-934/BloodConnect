import { Event } from "../../models/event.model.js";
import { Doctor } from "../../models/users/doctor.model.js";
import { Organization } from "../../models/users/organization.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { logger } from "../../index.js";

export const createEvent = asyncHandler(async (req, res) => {
    try {
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
            !address
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

        const [startHours, startMinutes] = startTime.split(":").map(Number);

        const startDateCoverted = new Date(
            startYear,
            startMonth - 1,
            startDay,
            startHours,
            startMinutes
        );

        const [endYear, endMonth, endDay] = endDate.split("-").map(Number);

        const [endHours, endMinutes] = endTime.split(":").map(Number);

        const endDateCoverted = new Date(
            endYear,
            endMonth - 1,
            endDay,
            endHours,
            endMinutes
        );

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

        const requestedOrganizationID = req.user?._id;

        const actualOrganization = await Organization.findById(
            requestedOrganizationID
        );

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

        if (!eventCreated) {
            throw new ApiError(
                500,
                "Error in creating new event. Please try again after some time..."
            );
        }

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
        logger.error(`Error in creating event: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
