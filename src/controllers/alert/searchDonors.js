import { Organization } from "../../models/users/organization.model.js";
import { Individual } from "../../models/users/user.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const searchDonors = asyncHandler(async (req, res) => {
    try {
        const { location } = req.query;
        const currentLocation = JSON.parse(location);
        const longitude = currentLocation.longitude;
        const latitude = currentLocation.latitude;
        const nearbyUsers = await Individual.find({
            currentLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [
                            parseFloat(String(longitude)),
                            parseFloat(String(latitude)),
                        ],
                    },
                    $maxDistance: 10000,
                },
            },
        });

        const nearbyOrganizations = await Organization.find({
            currentLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [
                            parseFloat(String(longitude)),
                            parseFloat(String(latitude)),
                        ],
                    },
                    $maxDistance: 10000,
                },
            },
        });

        nearbyUsers.push(...nearbyOrganizations);

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
