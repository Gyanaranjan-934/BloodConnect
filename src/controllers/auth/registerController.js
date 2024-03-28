import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { Individual } from "../../models/users/user.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import authService from "../../utils/appwrite.js";
import { Organization } from "../../models/users/organization.model.js";

export const registerIndividual = asyncHandler(async (req, res) => {
    try {
        const { fullName, email, username, password, phoneNo } = req.body;

        if (
            [fullName, email, username, password, phoneNo].some(
                (field) => field?.trim() === ""
            )
        ) {
            throw new ApiError(400, "All fields are required");
        }

        const isValidPhoneNumber = /^\d{10}$/.test(phoneNo);
        if (!isValidPhoneNumber) {
            throw new ApiError(400, "Phone number is invalid");
        }

        const existingUser = await Individual.findOne({
            $or: [{ username }, { email }, { phoneNo }],
        });

        if (existingUser) {
            throw new ApiError(
                409,
                "Individual with this email or username or phone number already exists"
            );
        }
        // console.log(req.files);
        // console.log("Existing user checked");
        const avatarLocalPath = req.file?.path;

        if (!avatarLocalPath)
            throw new ApiError(400, "Local Avatar is required");

        // console.log("Avatar local path checked");

        const avatar = await uploadOnCloudinary(avatarLocalPath);

        if (!avatar) {
            throw new ApiError(400, "Avatar is required");
        }

        // console.log("cloudinary upload successful");

        const user = await Individual.create({
            fullName,
            avatar: avatar?.url,
            email,
            password,
            username: username.toLowerCase(),
            phoneNo,
        });

        const createdUser = await Individual.findById(user._id).select(
            "-password -refreshToken"
        );

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong creating new user");
        }

        // console.log(createdUser);

        return res
            .status(201)
            .json(
                new ApiResponse(201, createdUser, "Individual created successfully")
            );
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            mesage: error?.message || "Internal Server Error",
        });
    }
});

export const registerOrganization = asyncHandler(async (req, res) => {
    try {
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

        if (!cinNo) {
            throw new ApiError(
                400,
                "Please provide a valid CIN number, so that we can verify you!!!"
            );
        }

        if (
            [
                organizationName,
                email,
                organizationHeadName,
                organizationHeadAdhaar,
                password,
                phoneNo,
                address,
                type,
            ].some((item) => item?.trim() === "")
        ) {
            throw new ApiError(400, "Please fill all the required details");
        }

        // check for existing organization
        const isValidPhoneNumber = /^\d{10}$/.test(phoneNo);
        if (!isValidPhoneNumber) {
            throw new ApiError(400, "Phone number is invalid");
        }

        const CINRegex = /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;

        const isValidCIN = CINRegex.test(cinNo);

        if (!isValidCIN) throw new ApiError(400, "Invaid CIN code");

        const existingOrganization = await Organization.findOne({
            $or: [{ organizationName }, { email }, { phoneNo }, { cinNo }],
        });

        if(existingOrganization){
            throw new ApiError(400,"There is an organization with this information already exists, please check your details and fill them correct.");
        }

        const organization = await Organization.create({
            organizationName,
            email,
            organizationName,
            organizationHeadAdhaar,
            password,
            phoneNo,
            address,
            type
        })

    } catch (error) {
        res.status(error?.statusCode || 500).json({
            mesage: error?.message || "Internal Server Error",
        });
    }
});
