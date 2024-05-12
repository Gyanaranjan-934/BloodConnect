import { Organization } from "../../models/users/organization.model.js";
import { Individual } from "../../models/users/individual.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const searchNearbyOrganizations = asyncHandler(async (req, res) => {
    try {
        const { location } = req.query;
        console.log(location);
        const currentLocation = JSON.parse(location);
        const longitude = currentLocation.longitude;
        const latitude = currentLocation.latitude;
        console.log(longitude, latitude); 
        const nearbyUsers = await Organization.find({
            currentLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [
                            parseFloat(String(longitude)),
                            parseFloat(String(latitude)),
                        ],
                    },
                    $maxDistance: 200000,
                },
            },
        }).select("_id name cinNo currentLocation email phone address");

        console.log(nearbyUsers);

        return res
            .status(200)
            .json(new ApiResponse(200, nearbyUsers, "Nearby users found"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            success: false,
            message: error?.message || "Internal Server Error",
        });
    }
});
