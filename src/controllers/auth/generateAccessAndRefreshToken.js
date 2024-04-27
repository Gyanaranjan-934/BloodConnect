import { Admin } from "../../models/users/admin.model.js";
import { Doctor } from "../../models/users/doctor.model.js";
import { Organization } from "../../models/users/organization.model.js";
import { Individual } from "../../models/users/user.model.js";
import { ApiError } from "../../utils/ApiError.js";

const generateAccessAndRefreshToken = async (userId, userType, location) => {
    try {
        let user = null;
        if (userType === "individual") {
            user = await Individual.findOne({ _id: userId });
        } else if (userType === "organization") {
            user = await Organization.findOne({ _id: userId });
        } else if (userType === "admin") {
            user = await Admin.findOne({ _id: userId });
        } else {
            user = await Doctor.findOne({ _id: userId });
        }

        const accessToken = user.generateAccessToken();

        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        const currentLocation = JSON.parse(location);
        console.log(currentLocation);
        const geoJsonLocation = {
            type: "Point",
            coordinates: [parseFloat(String(currentLocation.longitude)), parseFloat(String(currentLocation.latitude))],
        };
        user.currentLocation = geoJsonLocation;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal Server Error");
    }
};

export default generateAccessAndRefreshToken;
