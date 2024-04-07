import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { Individual } from "../../models/users/user.model.js";
import { Organization } from "../../models/users/organization.model.js";
import { Doctor } from "../../models/users/doctor.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { firebase } from "../../db/firebase.js";


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
    const createdUser = user.toObject();
    delete createdUser.password;
    delete createdUser.refreshToken;
    return createdUser;
};

const registerIndividual = asyncHandler(async (req, res) => {
    console.log(req);
    const { fullName, email, password, phoneNo, adhaarNo, bloodGroup, userDOB, presentAddress,permanentAddress, geolocation } = req.body;

    if (![fullName, email, password, phoneNo, adhaarNo, presentAddress, permanentAddress, userDOB].every(Boolean)) {
        throw new ApiError(400, "All fields are required");
    }

    if (!validatePhoneNumber(phoneNo)) {
        throw new ApiError(400, "Phone number is invalid");
    }

    const existingUser = await Individual.findOne({
        $or: [{ email }, { adhaarNo }, { phoneNo }],
    });
    if (existingUser) {
        throw new ApiError(
            409,
            "Individual with this email or phone number or adhaar already exists"
        );
    }

    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Local Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed");
    }

    const currLoc = JSON.parse(geolocation)
    const user = await createUser(Individual, {
        fullName,
        bloodGroup,
        avatar: avatar.url || "avatarURL",
        email,
        password,
        phoneNo,
        adhaarNo,
        presentAddress:JSON.parse(presentAddress),
        permanentAddress:JSON.parse(permanentAddress),
        dateOfBirth:userDOB,
        currentLocation: [currLoc?.latitude||0.00,currLoc?.longitude||0.00]
        
    });
    console.log(user);

    res.status(201).json(
        new ApiResponse(201, user, "Individual created successfully")
    );
});

const registerOrganization = asyncHandler(async (req, res) => {
    const {
        organizationName,
        email,
        organizationHeadName,
        organizationHeadAdhaar,
        password,
        phoneNo,
        address,
        type,
        cinNo,
    } = req.body;

    if (
        ![
            organizationName,
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
        $or: [{ organizationName }, { email }, { phoneNo }, { cinNo }],
    });
    if (existingOrganization) {
        throw new ApiError(
            400,
            "Organization with this information already exists"
        );
    }

    const user = await createUser(Organization, {
        organizationName,
        email,
        organizationHeadName,
        organizationHeadAdhaar,
        password,
        phoneNo,
        address,
        typeOfOrganization:type,
        cinNo,
    });

    res.status(201).json(
        new ApiResponse(201, user, "Organization created successfully")
    );
});

const registerAsDoctor = asyncHandler(async (req, res) => {
    console.log(req);
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

    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Local Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    // if (!avatar) {
    //     throw new ApiError(400, "Avatar upload failed");
    // }

    const user = await createUser(Doctor, {
        fullName,
        avatar: avatar?.url || "avatarURL",
        email,
        password,
        phoneNo,
        gender,
        dateOfBirth,
        doctorId
    });

    res.status(201).json(
        new ApiResponse(201, user, "User created successfully")
    );
});

export { registerIndividual, registerOrganization, registerAsDoctor };
