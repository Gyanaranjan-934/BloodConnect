import { Alert } from "../../models/alert.model.js";
import { Individual } from "../../models/users/individual.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendEmail } from "../../utils/nodemailer.js";
import { logger } from "../../index.js";

export const updateAlert = asyncHandler(async (req, res) => {
    try {
        const {
            alertId,
            patientName,
            problemDescription,
            age,
            gender,
            bloodGroup,
            address,
            currentLocationCoord,
            dateOfRequirement,
            expiryTime,
            noOfDonorsToSend,
        } = req.body;

        const alert = await Alert.findById(alertId);
        if (!alert || alert.senderId !== req.user._id) {
            throw new ApiError(
                401,
                "Either you are not the owner of the alert or the alert does not exist"
            );
        }

        const currentLocation = JSON.parse(currentLocationCoord);
        const longitude = currentLocation.longitude;
        const latitude = currentLocation.latitude;
        
        // Find nearby users within 10 kilometers
        const nearbyUsers = await Individual.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                    distanceField: "distance", // Field to add distance from the queried point
                    spherical: true,
                },
            },
            { $limit: parseInt(noOfDonorsToSend) }, // Limit the number of results
        ]);
        const [year, month, day] = dateOfRequirement.split("-").map(Number);

        // Parse the time string to extract hours and minutes
        const [hours, minutes] = expiryTime.split(":").map(Number);

        // Create a new Date object using the parsed components
        const combinedDate = new Date(year, month - 1, day, hours, minutes);

        const imageLocalPath = req.file?.path;
        let imageCloudinaryUrl = null;
        if (imageLocalPath) {
            imageCloudinaryUrl = await uploadOnCloudinary(imageLocalPath);
            if (imageCloudinaryUrl) {
                imageCloudinaryUrl = imageCloudinaryUrl.url;
            }
        }

        const updateAlert = await Alert.findByIdAndUpdate(
            alertId,
            {
                patientName,
                problemDescription,
                age,
                gender,
                bloodGroup,
                address,
                currentLocation: {
                    type: {
                        type: "Point",
                        enum: ["Point"],
                        required: true,
                    },
                    coordinates: [longitude, latitude],
                },
                dateOfRequirement,
                expiryTime,
                noOfDonorsToSend,
                patientPhoto: imageCloudinaryUrl
                    ? imageCloudinaryUrl
                    : alert.patientPhoto,
                recipients: nearbyUsers.map((user) => ({
                    recipientId: user?._id,
                    isResponded: false,
                    invitationAccepted: false,
                })),
            },
            {
                new: true,
            }
        );

        return res
            .status(200)
            .json(new ApiResponse(200, updateAlert, "Alert updated successfully"));
    } catch (error) {
        logger.error(`Error in updating alert: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const respondAlert = asyncHandler(async (req, res) => {
    try {
        const { alertId, isAccepted } = req.body;
        const receiptantId = req.user._id;
        const alert = await Alert.findById(alertId);
        if (!alert) {
            throw new ApiError(404, "Alert does not exist");
        }
        
        const recipient = alert.recipients.find(
            (r) => r.recipientId.equals(receiptantId)
        );
        
        if (!recipient) {
            throw new ApiError(404, "You are not the recipient of the alert");
        }

        if (recipient.isResponded) {
            throw new ApiError(400, "You have already responded to this alert");
        }

        recipient.isResponded = true;
        recipient.invitationAccepted = isAccepted;

        await alert.save();

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "You have responded to the alert")
            );
    } catch (error) {
        logger.error(`Error in responding alert: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const updateAlertReceiptantBySender = asyncHandler(async (req, res) => {
    try {
        const { alertId, receiptantIds } = req.body;
        const alert = await Alert.findById(alertId).populate("senderId");
        if (!alert || alert.senderId !== req.user._id) {
            throw new ApiError(
                404,
                "Alert does not exist or you are not the sender of the alert"
            );
        }

        const updatedReceiptantIds = receiptantIds.map((receiptantId) => {
            return {
                receiptantId: receiptantId,
                isResponded: false,
                invitationAccepted: false,
            };
        });


        alert.isSendToRecipients = true;
        alert.recipients = updatedReceiptantIds;
        await alert.save();

        res.status(200).json(
            new ApiResponse(200, alert, "Alert receiptants updated successfully, soon they will receive the mail of the alert")
        );

        const recipients = await Individual.find({
            _id: { $in: receiptantIds },
        });

        // Update each recipient's receivedAlerts array
        await Promise.all(
            recipients.map(async (recipient) => {
                recipient.receivedAlerts.push(alertId); // Assuming alertId is the ID of the new alert
                await recipient.save(); // Save the updated recipient
            })
        );

        // Send Emails to each recipient

        const html = `
            <div>
                <h1 style="text-align: center; font-size: 24px; color: "Red"; font-weight: bold;">Alert Received</h1>
                <p style="text-align: center; font-size: 16px; color: "Red"; font-weight: bold;">You have received an alert from ${alert.senderId.email} for patient named ${alert.patientName}</p>
                <p style="text-align: center; font-size: 16px; color: "Red"; font-weight: bold;">Please respond to the alert in the application.</p>
                <div style="display:flex; flex-direction: column; justify-content: center; align-items: center;">
                        <p>Date of Requirement : ${alert.dateOfRequirement}</p>
                        <p>Exipary Time of Alert : ${alert.expiryTime}</p>
                        <p>Patient Name : ${alert.patientName}</p>
                        <img src="${alert.patientPhoto}" alt="Patient Photo" style="width:200px; height:200px;">
                        <p>Patient Blood Group : ${alert.bloodGroup}</p>
                        <p>Patient Problem Description : ${alert.problemDescription}</p>
                        <p>Patient Age : ${alert.age}</p>
                        <p>Patient Gender : ${alert.gender}</p>
                        <p>Patient Address : ${alert.address}</p>
                        <p>Patient Phone Number : ${alert.phoneNo}</p>
                </div>
                <p style="text-align: center; font-size: 16px; color: "Red"; font-weight: bold;">Thank you for your cooperation.</p>

                <p>Please do not reply to this email. If you have any questions, please contact the respective person.</p>
            </div>
        `;

        recipients.map((recipient) => {
            const emailSubject = "Alert Received";
            const emailText = `Hii ${recipient.fullName.split(" ")[0]}, You have received an alert from ${alert.senderId.email} for patient named ${alert.patientName}`;
            const bodyHTML = html;
            sendEmail(recipient.email, emailSubject, emailText, bodyHTML);
        });

        return;
    } catch (error) {
        logger.error(`Error in sending alert to recipients: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
