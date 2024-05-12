import { Admin } from "../../models/users/admin.model.js";
import { Doctor } from "../../models/users/doctor.model.js";
import { Organization } from "../../models/users/organization.model.js";
import { Individual } from "../../models/users/individual.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import generateAccessAndRefreshToken from "./generateAccessAndRefreshToken.js";

const loginUser = async (
    UserModel,
    identifier,
    password,
    location,
    role,
    res
) => {
    if (!identifier) {
        throw new ApiError(400, `${role} identifier is required !!!`);
    }

    const user = await UserModel.findOne({
        email: identifier,
    });

    if (!user) {
        throw new ApiError(404, `${role} does not exist`);
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        if (role === "individual" || role === "organization") {
            // reset the password for the user
            user.password = password;
            await user.save({ validateBeforeSave: true });
        } else {
            throw new ApiError(401, "Invalid user credentials");
        }
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id,
        role,
        location
    );

    const loggedInUser = await UserModel.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully."
            )
        );
};

export const loginIndividual = asyncHandler(async (req, res) => {
    try {
        const { email, password, location, userType } = req.body;
        await loginUser(
            Individual,
            email,
            password,
            location,
            userType,
            res
        );
    } catch (error) {
        console.log(error);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const loginOrganization = asyncHandler(async (req, res) => {
    try {
        const { email, password, location, userType } = req.body;
        await loginUser(
            Organization,
            email,
            password,
            location,
            userType,
            res
        );
    } catch (error) {
        console.log(error);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const loginAdmin = asyncHandler(async (req, res) => {
    try {
        const { email, password, location } = req.body;
        const identifier = email;
        await loginUser(Admin, identifier, password, location, "admin", res);
    } catch (error) {
        console.log(error);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const loginDoctor = asyncHandler(async (req, res) => {
    try {
        const { email, password, location } = req.body;
        const identifier = email;
        await loginUser(Doctor, identifier, password, location, "doctor", res);
    } catch (error) {
        console.log(error);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
