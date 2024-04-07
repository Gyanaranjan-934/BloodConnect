import { Admin } from "../../models/users/admin.model.js";
import { Doctor } from "../../models/users/doctor.model.js";
import { Organization } from "../../models/users/organization.model.js";
import { Individual } from "../../models/users/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import generateAccessAndRefreshToken from "./generateAccessAndRefreshToken.js";

const loginUser = async (UserModel, identifier, password, role, res) => {
    if (!identifier) {
        throw new ApiError(400, `${role} identifier is required !!!`);
    }

    const user = await UserModel.findOne({
        $or: [{ email: identifier }, { doctorId: identifier }],
    });

    if (!user) {
        throw new ApiError(404, `${role} does not exist`);
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id, role);

    const loggedInUser = await UserModel.findById(user._id).select("-password -refreshToken");

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
        const { email, password } = req.body;
        await loginUser(Individual, email, password, "individual", res);
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const loginOrganization = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        await loginUser(Organization, email, password, "organization", res);
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const loginAdmin = asyncHandler(async (req, res) => {
    try {
        const { email, adminId, password } = req.body;
        const identifier = email || adminId;
        await loginUser(Admin, identifier, password, "admin", res);
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const loginDoctor = asyncHandler(async (req, res) => {
    try {
        const { email, doctorId, password } = req.body;
        const identifier = email || doctorId;
        await loginUser(Doctor, identifier, password, "doctor", res);
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
