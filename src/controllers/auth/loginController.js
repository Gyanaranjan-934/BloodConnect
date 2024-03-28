import { Individual } from "../../models/users/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import authService from "../../utils/appwrite.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import generateAccessAndRefreshToken from "./generateAccessAndRefreshToken.js";

const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (!username && !email) {
            throw new ApiError(400, "Username or email is required !!!");
        }
    
        const user = await Individual.findOne({
            $or: [{ username }, { email }]
        })
    
        if (!user) {
            throw new ApiError(404, "Individual does not exist");
        }
    
        const isPasswordValid = await user.isPasswordCorrect(password);
    
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
        }
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    
        const loggedInUser = await Individual.findOne(user._id).select("-password -refreshToken");
        
        const options = {
            httpOnly: true,
            secure: true,
        }
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
                    "Individual logged in successfully.")
                )
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            mesage: error?.message || "Internal Server Error"
        })
    }
})

export default loginUser