import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { Individual } from "../../models/users/individual.model.js";
import { Organization } from "../../models/users/organization.model.js";
import { Doctor } from "../../models/users/doctor.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { logger } from "../../index.js";

const validatePhoneNumber = (phoneNo) => /^\d{10}$/.test(phoneNo);
const validateCIN = (cinNo) =>
    /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(cinNo);

const registerIndividual = asyncHandler(async (req, res) => {
    try {
        const { name, email, password, bloodGroup, currentLocation } = req.body;

        if (![name, email, password, bloodGroup].every(Boolean)) {
            throw new ApiError(400, "All fields are required");
        }

        const existingUser = await Individual.findOne({
            email,
        });

        if (existingUser) {
            throw new ApiError(409, "User with this email already exists");
        }

        const user = new Individual({
            name,
            bloodGroup,
            email,
            password,
            currentLocation: {
                type: "Point",
                coordinates: [
                    parseFloat(String(currentLocation.longitude)),
                    parseFloat(String(currentLocation.latitude)),
                ],
            },
        });
        await user.save();

        res.status(201).json(
            new ApiResponse(201, user, "Individual created successfully")
        );
    } catch (error) {
        logger.error(`Error in registering individual: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

const registerOrganization = asyncHandler(async (req, res) => {
    try {
        const {
            name,
            email,
            organizationHeadName,
            organizationHeadAdhaar,
            password,
            phone,
            address,
            typeOfOrganization,
            cinNo,
            currentLocation,
        } = req.body;

        if (
            !name ||
            !email ||
            !organizationHeadName ||
            !organizationHeadAdhaar ||
            !password ||
            !phone ||
            !address ||
            !typeOfOrganization ||
            !cinNo ||
            !currentLocation
        ) {
            throw new ApiError(400, "Please fill all the required details");
        }

        if (!validatePhoneNumber(phone)) {
            throw new ApiError(400, "Phone number is invalid");
        }

        if (!validateCIN(cinNo)) {
            throw new ApiError(400, "Invalid CIN code");
        }

        const existingOrganization = await Organization.exists({
            $or: [{ name }, { email }, { phone }, { cinNo }],
        });
        if (existingOrganization) {
            throw new ApiError(
                400,
                "Organization with this information already exists"
            );
        }

        const user = await Organization.create({
            name,
            email,
            organizationHeadName,
            organizationHeadAdhaar,
            password,
            phone,
            address: {
                street: address.street,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
            },
            typeOfOrganization:
                String(typeOfOrganization).charAt(0).toUpperCase() +
                String(typeOfOrganization).slice(1),
            cinNo,
            currentLocation: {
                type: "Point",
                coordinates: [
                    parseFloat(String(currentLocation.longitude)),
                    parseFloat(String(currentLocation.latitude)),
                ],
            },
        });

        res.status(201).json(
            new ApiResponse(201, user, "Organization created successfully")
        );
    } catch (error) {
        logger.error(`Error in registering organization: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

const registerAsDoctor = asyncHandler(async (req, res) => {
    try {
        const { name, email, doctorId, password, phone } = req.body;

        if (!name || !email || !doctorId || !password || !phone) {
            throw new ApiError(400, "All fields are required");
        }

        if (!validatePhoneNumber(phone)) {
            throw new ApiError(400, "Phone number is invalid");
        }

        const existingUser = await Doctor.findOne({
            $or: [{ email }, { phone }, { doctorId }],
        });
        if (existingUser) {
            throw new ApiError(
                409,
                "Individual with this email or doctorId or phone number already exists"
            );
        }

        const user = await Doctor.create({
            name,
            email,
            password,
            phone,
            doctorId,
        });

        res.status(201).json(
            new ApiResponse(201, user, "User created successfully")
        );
    } catch (error) {
        logger.error(`Error in registering doctor: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export { registerIndividual, registerOrganization, registerAsDoctor };
