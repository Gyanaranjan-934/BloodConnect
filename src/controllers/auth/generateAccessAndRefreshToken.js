import { Individual } from "../../models/users/user.model.js";
import { ApiError } from "../../utils/ApiError.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await Individual.findOne({ _id: userId });

        const accessToken = user.generateAccessToken();
        
        const refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        
        await user.save({ validateBeforeSave: false });
        
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal Server Error");
    }
}

export default generateAccessAndRefreshToken