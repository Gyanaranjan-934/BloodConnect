import { Admin } from "../models/users/admin.model.js";
import { Doctor } from "../models/users/doctor.model.js";
import { Organization } from "../models/users/organization.model.js";
import { Individual } from "../models/users/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';

const getUserByToken = async (token) => {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    let user;
    const userTypes = [Individual, Organization, Admin, Doctor];
    
    for (const UserType of userTypes) {
        user = await UserType.findById(decodedToken?._id).select("-password -refreshToken");
        if (user) {
            user.type = UserType === Admin ? "admin" : UserType.modelName.toLowerCase();
            break;
        }
    }
    
    return user;
};

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized request !!!");
        }
        const user = await getUserByToken(token);
        if (!user) {
            throw new ApiError(401, "Invalid access token !!!");
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error?.errors || [],
        });
    }
});
