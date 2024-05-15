import { asyncHandler } from "../../utils/asyncHandler.js";
import { Organization } from "../../models/users/organization.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { Event } from "../../models/event.model.js";
import { Doctor } from "../../models/users/doctor.model.js";
import { logger } from "../../index.js";

export const getAllOrganizations = asyncHandler(async (req, res) => {
    try {
        const pageNo = req.query.pageNo || 0;
        const organizations = await Organization.find()
            .select(
                "_id name email cinNo typeOfOrganization address phone createdAt isVerified"
            )
            .sort({ createdAt: -1 })
            .limit(5)
            .skip(pageNo * 5);
        const totalCount = await Organization.countDocuments();
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    organizations,
                    pageNo,
                    totalCount,
                },
                `Organization details found for page no. ${pageNo}`
            )
        );
    } catch (error) {
        logger.error(`Error in getting all organizations: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const getAllEvents = asyncHandler(async (req, res) => {
    try {
        const pageNo = req.query.pageNo || 0;
        const events = await Event.find()
            .populate("organizationId")
            .populate("doctors")
            .sort({ createdAt: -1 })
            .limit(5)
            .skip(pageNo * 5);
        const totalCount = await Event.countDocuments();
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    events,
                    pageNo,
                    totalCount,
                },
                `Event details found for page no. ${pageNo}`
            )
        );
    } catch (error) {
        logger.error(`Error in getting all events: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const getAllDoctors = asyncHandler(async (req, res) => {
    try {
        const pageNo = req.query.pageNo || 0;
        const doctors = await Doctor.find()
            .select("_id name email phone createdAt isVerified")
            .sort({ createdAt: -1 })
            .limit(5)
            .skip(pageNo * 5);
        const totalCount = await Doctor.countDocuments();
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    doctors,
                    pageNo,
                    totalCount,
                },
                `Doctor details found for page no. ${pageNo}`
            )
        );
    } catch (error) {
        logger.error(`Error in getting all doctors: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const getOrganizationDetails = asyncHandler(async (req, res) => {
    try {
        const { organizationId } = req.query || req.params;
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            throw new ApiError(404, "Organization not found");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(200, organization, "Organization details found")
            );
    } catch (error) {
        logger.error(`Error in getting organization details: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const verifyOrganization = asyncHandler(async (req, res) => {
    try {
        const { organizationId } = req.params;

        const organization = await Organization.findOne({
            _id: organizationId,
        });

        if (!organization) {
            throw new ApiError(404, "Organization not found");
        }
        const isVerified = await organization.isVerified;
        if (isVerified) {
            throw new ApiError(400, "Organization is already verified");
        }
        organization.isVerified = true;
        await organization.save();
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    organization,
                    "Organization verified successfully"
                )
            );
    } catch (error) {
        logger.error(`Error in verifying organization: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const verifyEvent = asyncHandler(async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findOne({ _id: eventId });
        if (!event) {
            throw new ApiError(404, "Event not found");
        }
        const isVerified = await event.isVerified;
        if (isVerified) {
            throw new ApiError(400, "Event is already verified");
        }
        event.isVerified = true;
        await event.save();
        return res
            .status(200)
            .json(new ApiResponse(200, event, "Event verified successfully"));
    } catch (error) {
        logger.error(`Error in verifying event: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const verifyDoctor = asyncHandler(async (req, res) => {
    try {
        const { doctorId } = req.params;
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            throw new ApiError(404, "Doctor not found");
        }
        const isVerified = await doctor.isVerified;
        if (isVerified) {
            throw new ApiError(400, "Doctor is already verified");
        }
        doctor.isVerified = true;
        await doctor.save();
        return res
            .status(200)
            .json(new ApiResponse(200, doctor, "Doctor verified successfully"));
    } catch (error) {
        logger.error(`Error in verifying doctor: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const deleteOrganization = asyncHandler(async (req, res) => {
    try {
        const { organizationId } = req.params;
        const organization =
            await Organization.findByIdAndDelete(organizationId);
        if (!organization) {
            throw new ApiError(404, "Organization not found");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "Organization deleted successfully")
            );
    } catch (error) {
        logger.error(`Error in deleting organization: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const deleteEvent = asyncHandler(async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findByIdAndDelete(eventId);
        if (!event) {
            throw new ApiError(404, "Event not found");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Event deleted successfully"));
    } catch (error) {
        logger.error(`Error in deleting event: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const deleteDoctor = asyncHandler(async (req, res) => {
    try {
        const { doctorId } = req.params;
        const doctor = await Doctor.findByIdAndDelete(doctorId);
        if (!doctor) {
            throw new ApiError(404, "Doctor not found");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Doctor deleted successfully"));
    } catch (error) {
        logger.error(`Error in deleting doctor: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
