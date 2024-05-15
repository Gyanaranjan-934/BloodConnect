import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Individual } from "../../models/users/individual.model.js";
import { Organization } from "../../models/users/organization.model.js";
import { logger } from "../../index.js";

export const updateIndividualProfile = asyncHandler(async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            bloodGroup,
            adhaarNo,
            gender,
            dateOfBirth,
            presentAddress,
            permanentAddress,
            currentLocation,
        } = req.body;

        const user = await Individual.findById(req.user._id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const updatedUser = await Individual.findByIdAndUpdate(req.user._id, {
            name,
            email,
            phone,
            bloodGroup,
            adhaarNo,
            gender,
            dateOfBirth,
            presentAddress,
            permanentAddress,
            currentLocation: {
                type: "Point",
                coordinates: [
                    parseFloat(String(currentLocation.longitude)),
                    parseFloat(String(currentLocation.latitude)),
                ],
            },
        });

        return res
            .status(200)
            .json(
                new ApiResponse(200, updatedUser, "User updated successfully")
            );
    } catch (error) {
        logger.error(`Error in updating individual profile: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const updateOrganizationProfile = asyncHandler(async (req, res) => {
    try {
        const {
            name,
            email,
            organizationHeadName,
            organizationHeadAdhaar,
            cinNo,
            typeOfOrganization,
            address,
            phoneNo,
        } = req.body;
        const organization = await Organization.findById(req.user._id);
        if (!organization) {
            throw new ApiError(404, "Organization not found");
        }
        organization.name = name;
        organization.email = email;
        organization.organizationHeadName = organizationHeadName;
        organization.organizationHeadAdhaar = organizationHeadAdhaar;
        organization.cinNo = cinNo;
        organization.typeOfOrganization = typeOfOrganization;
        organization.address = address;
        organization.phoneNo = phoneNo;
        await organization.save();
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    organization,
                    "Organization updated successfully"
                )
            );
    } catch (error) {
        logger.error(`Error in updating organization profile: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
