import { Alert } from "../../models/alert.model";
import { asyncHandler } from "../../utils/asyncHandler";
import nodeMailer from "nodemailer"
// Function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
};

export const createAlert = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?._id;

        const userType = req.user?.type;

        const { patientName, currentLocation, expiryTime, noOfDonorsToSend } =
            req.body;
        
        const paitentPhotoLocalPath = req.file?.path;
        let patientPhoto = { url: "" };
        if (paitentPhotoLocalPath) {
            patientPhoto = await uploadOnCloudinary(paitentPhotoLocalPath);
        }

        const patientLocation = {
            type: "Point",
            coordinates: currentLocation
        }

        

        // Now we have to send the alert to nearby users

        const nearbyUsers = await Individual.find({
            currentLocation: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: currentLocation,
                    },
                    $maxDistance: 10000, // Maximum distance in meters (adjust as needed)
                },
            },
        }).limit(noOfDonorsToSend);
        

        const alert = await Alert.create({
            senderId: userId,
            senderType:
                userType === "individual" ? "Individual" : "Organization",
            patientName: patientName,
            currentLocation: patientLocation,
            expiryTime,
            patientPhoto: patientPhoto.url,
            recipients: nearbyUsers.map(user => ({
                receiptantId: user?._id,
                isResponded: false,
                invitationAccepted: false
            }))
        });

        return res.status(201).json(new ApiResponse(201,alert,"Alert created successfully"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});


