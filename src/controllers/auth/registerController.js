import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { Individual } from "../../models/users/user.model.js";
import { Organization } from "../../models/users/organization.model.js";
import { Doctor } from "../../models/users/doctor.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const validatePhoneNumber = (phoneNo) => /^\d{10}$/.test(phoneNo);
const validateCIN = (cinNo) =>
    /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(cinNo);

const createUser = async (Model, data) => {
    const user = await Model.create(data);
    if (!user) {
        throw new ApiError(
            500,
            "Error in creating new user. Please try again after some time..."
        );
    }
    console.log(user);
    const createdUser = user.toObject();
    return createdUser;
};

const registerIndividual = asyncHandler(async (req, res) => {
    try {
        console.log(req.body);
        const {
            name,
            email,
            password,
            phone,
            adhaarNo,
            bloodGroup,
            dateOfBirth,
            presentAddress,
            permanentAddress,
            geolocation,
        } = req.body;

        console.log(JSON.parse(presentAddress));

        if (
            ![
                name,
                email,
                password,
                phone,
                dateOfBirth,
                adhaarNo,
                presentAddress,
                permanentAddress,
            ].every(Boolean)
        ) {
            throw new ApiError(400, "All fields are required");
        }

        if (!validatePhoneNumber(phone)) {
            throw new ApiError(400, "Phone number is invalid");
        }

        const existingUser = await Individual.findOne({
            $or: [{ email }, { adhaarNo }, { phone }],
        });
        if (existingUser) {
            throw new ApiError(
                409,
                "Individual with this email or phone number or adhaar already exists"
            );
        }

        const presentAddressParsed = JSON.parse(presentAddress);
        const permanentAddressParsed = JSON.parse(permanentAddress);

        const currentLocation = JSON.parse(geolocation);

        const user = new Individual({
            name,
            bloodGroup,
            avatar: "",
            email,
            password,
            phone,
            adhaarNo,
            presentAddress: {
                street: presentAddressParsed.street,
                city: presentAddressParsed.city,
                state: presentAddressParsed.state,
                pincode: presentAddressParsed.pincode,
            },
            permanentAddress: {
                street: permanentAddressParsed.street,
                city: permanentAddressParsed.city,
                state: permanentAddressParsed.state,
                pincode: permanentAddressParsed.pincode,
            },
            dateOfBirth: new Date(dateOfBirth),
            currentLocation: {
                type: "Point",
                coordinates: [
                    parseFloat(String(currentLocation.longitude)),
                    parseFloat(String(currentLocation.latitude)),
                ],
            },
        });
        await user.save();
        console.log(user);
        res.status(201).json(
            new ApiResponse(201, user, "Individual created successfully")
        );
    } catch (error) {
        console.log(error);
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
            phoneNo,
            address,
            type,
            cinNo,
            currentLocation,
        } = req.body;

        if (
            ![
                name,
                email,
                organizationHeadName,
                organizationHeadAdhaar,
                password,
                phoneNo,
                address,
                type,
                cinNo,
            ].every(Boolean)
        ) {
            throw new ApiError(400, "Please fill all the required details");
        }

        if (!validatePhoneNumber(phoneNo)) {
            throw new ApiError(400, "Phone number is invalid");
        }

        if (!validateCIN(cinNo)) {
            throw new ApiError(400, "Invalid CIN code");
        }

        const existingOrganization = await Organization.exists({
            $or: [{ name }, { email }, { phoneNo }, { cinNo }],
        });
        if (existingOrganization) {
            throw new ApiError(
                400,
                "Organization with this information already exists"
            );
        }

        const addressParsed = JSON.parse(address);

        const geolocation = JSON.parse(currentLocation);

        const user = await Organization.create({
            name,
            email,
            organizationHeadName,
            organizationHeadAdhaar,
            password,
            phoneNo,
            address: {
                street: addressParsed.street,
                city: addressParsed.city,
                state: addressParsed.state,
                pincode: addressParsed.pincode,
            },
            typeOfOrganization:
                String(type).charAt(0).toUpperCase() + String(type).slice(1),
            cinNo,
            currentLocation: {
                type: "Point",
                coordinates: [
                    parseFloat(String(geolocation.longitude)),
                    parseFloat(String(geolocation.latitude)),
                ],
            },
        });

        res.status(201).json(
            new ApiResponse(201, user, "Organization created successfully")
        );
    } catch (error) {
        console.log(error);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

const registerAsDoctor = asyncHandler(async (req, res) => {
    try {
        const {
            fullName,
            email,
            doctorId,
            password,
            phoneNo,
            gender,
            dateOfBirth,
        } = req.body;

        if (
            ![
                fullName,
                email,
                doctorId,
                password,
                phoneNo,
                gender,
                dateOfBirth,
            ].every(Boolean)
        ) {
            throw new ApiError(400, "All fields are required");
        }

        if (!validatePhoneNumber(phoneNo)) {
            throw new ApiError(400, "Phone number is invalid");
        }

        const existingUser = await Doctor.findOne({
            $or: [{ email }, { phoneNo }, { doctorId }],
        });
        if (existingUser) {
            throw new ApiError(
                409,
                "Individual with this email or doctorId or phone number already exists"
            );
        }

        const user = await Doctor.create({
            fullName,
            avatar: "",
            email,
            password,
            phoneNo,
            gender: String(gender).charAt(0).toUpperCase() + String(gender).slice(1),
            dateOfBirth,
            doctorId,
        });

        res.status(201).json(
            new ApiResponse(201, user, "User created successfully")
        );
    } catch (error) {
        console.log(error);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export { registerIndividual, registerOrganization, registerAsDoctor };
