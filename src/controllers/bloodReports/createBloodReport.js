import { BloodReport } from "../../models/bloodReport.model.js";
import { Event } from "../../models/event.model.js";
import { Individual } from "../../models/users/individual.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { logger } from "../../index.js";

export const createBloodReport = asyncHandler(async (req, res) => {
    try {
        const {
            bloodUnits,
            heartRate,
            bloodSugar,
            hemoglobin,
            bloodPressure,
            weight,
            height,
            userId,
            lastCamp,
        } = req.body;
        
        const doctorId = req.user?._id;

        const donor = await Individual.findById(userId);
        
        const camp = await Event.findById(lastCamp);
        
        if(donor && camp){
            const isAttendedBefore = donor.eventsAttended.some((attendedEvent) => {
                return (
                    attendedEvent.eventId.equals(camp._id) &&
                    attendedEvent.doctorId.equals(doctorId)
                );
            });

            if(isAttendedBefore){
                throw new ApiError(400,"You have already attended this event");
            }
        }
        
        const bloodReport = await BloodReport.create({
            userId: donor._id,
            bloodGroup: donor.bloodGroup,
            bloodPressure,
            heartRateCount: heartRate,
            sugarLevel: bloodSugar,
            hemoglobinCount: hemoglobin,
            weight,
            height,
            updateBy: doctorId,
            lastCamp: camp._id,
        });

        // Now update the status of the individual and the event
        donor.bloodReports.push(bloodReport._id);
        
        donor.eventsAttended.push({ eventId: camp._id, doctorId, donationDate: new Date(), bloodUnits });
        
        await donor.save();

        camp.donorsAttended.push({
            donorId: donor._id,
            doctorId,
            dateOfDonation: new Date(),
            bloodUnits
        });
        await camp.save();

        res.status(201).json(
            new ApiResponse(
                201,
                bloodReport,
                "Blood report saved successfully"
            )
        );
    } catch (error) {
        logger.error(`Error in creating blood report: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
