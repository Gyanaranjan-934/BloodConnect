import { Admin } from "../models/users/admin.model.js";
import { Doctor } from "../models/users/doctor.model.js";
import { Organization } from "../models/users/organization.model.js";
import { Individual } from "../models/users/individual.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { logger } from "../index.js";

const getUserByToken = async (token, userType) => {
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if(!decodedToken){
            throw new ApiError(401, "Invalid access token !!!");
        }
        let user;
        if (userType === "individual") {
            user = await Individual.findById(decodedToken?._id).select(
                "-password -refreshToken"
            );
        } else if (userType === "organization") {
            user = await Organization.findById(decodedToken?._id).select(
                "-password -refreshToken"
            );
        } else if (userType === "doctor") {
            user = await Doctor.findById(decodedToken?._id).select(
                "-password -refreshToken"
            );
        } else {
            user = await Admin.findById(decodedToken?._id).select(
                "-password -refreshToken"
            );
        }

        return user;
    } catch (error) {
        logger.error(`Error in getting user by token: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error?.errors || [],
        });
    }
};

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        logger.info(`Token is valid: ${token !== null}`);
        if (!token) {
            throw new ApiError(401, "Unauthorized request !!!");
        }
        const userType = req.header("userType");
        const user = await getUserByToken(token, userType);
        if (!user) {
            throw new ApiError(401, "Invalid access token !!!");
        }
        req.userType = userType;
        req.user = user;
        next();
    } catch (error) {
        logger.error(`Error in verifying JWT: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error?.errors || [],
        });
    }
});

export const verifyAdmin = asyncHandler(async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        const isAdmin = req.header("userType") === "admin";

        if (!token || !isAdmin) {
            throw new ApiError(401, "Unauthorized request !!!");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if(!decodedToken){
            throw new ApiError(401, "Invalid access token !!!");
        }
        const user = await Admin.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );
        if (!user) {
            throw new ApiError(401, "Invalid access token !!!");
        }

        req.userType = "admin";
        
        req.user = user;
        
        next();
    } catch (error) {
        logger.error(`Error in verifying admin JWT: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error?.errors || [],
        });
    }
});