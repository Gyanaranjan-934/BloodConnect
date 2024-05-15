import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Alert } from "../../models/alert.model.js";
import { Individual } from "../../models/users/individual.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { rediesClient } from "../../utils/redies.js";
import { sendEmail } from "../../utils/nodemailer.js";
import { logger } from "../../index.js";
import { ApiError } from "../../utils/ApiError.js";

/*
    Create an alert for a patient:
    1. Before creating the alert, check if the requested user is appliction user or not
    2. After that search nearby users as per the given location parameters
    3. After that send the users to the client and cache the alert details in redis
    4. After getting the response from the client, create the alert in the database
    5. After that send the alert to the client

*/

export const createAlert = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        const userType = req.userType;
        const {
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

        const currentLocation = JSON.parse(currentLocationCoord);
        const longitude = currentLocation.longitude;
        const latitude = currentLocation.latitude;

        let nearbyUsers = await Individual.find({
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
        })
            .limit(parseInt(noOfDonorsToSend))
            .select(
                "-password -refreshToken -bloodReports -__v -eventsAttended -eventsRegistered -receivedAlerts"
            );

        nearbyUsers = nearbyUsers.filter(
            (user) => user.bloodGroup === bloodGroup
        );

        // send the response to the client and cache the alert details in redis

        const imageLocalPath = req.file?.path;
        let imageCloudinaryUrl = "";
        if (imageLocalPath) {
            imageCloudinaryUrl = await uploadOnCloudinary(imageLocalPath);
            if (imageCloudinaryUrl) {
                imageCloudinaryUrl = imageCloudinaryUrl.url;
            }
        }

        const alertDetails = JSON.stringify({
            patientName,
            problemDescription,
            age,
            gender,
            bloodGroup,
            address,
            dateOfRequirement,
            expiryTime,
            noOfDonorsToSend,
            imageCloudinaryUrl,
            currentLocationCoord,
        });

        // store the alert details in redis for caching for 5 minutes
        await rediesClient.setEx(String(userId), 3000, alertDetails);

        return res
            .status(201)
            .json(new ApiResponse(201, nearbyUsers, "Nearby users found"));
    } catch (error) {
        logger.error(`Error in shadow creating alert: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const getDonorListAndCreateAlert = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const userType = req.userType;
        const { donorList } = req.body;

        let alertDetails = await rediesClient.get(String(userId));

        if (alertDetails) {
            await rediesClient.unlink(String(userId));
        } else {
            throw new ApiError(
                400,
                "The time limit has been expired, sorry for the inconvenience. Please try again after some time..."
            );
        }
        alertDetails = JSON.parse(alertDetails);

        if (donorList) {
            const [year, month, day] = alertDetails.dateOfRequirement
                .split("-")
                .map(Number);

            // Parse the time string to extract hours and minutes
            const [hours, minutes] = alertDetails.expiryTime
                .split(":")
                .map(Number);

            // Create a new Date object using the parsed components
            const combinedDate = new Date(year, month - 1, day, hours, minutes);
            const currentLocation = JSON.parse(
                alertDetails.currentLocationCoord
            );
            const longitude = currentLocation.longitude;
            const latitude = currentLocation.latitude;
            // Create an alert document
            const alert = await Alert.create({
                senderId: userId,
                senderType:
                    userType === "individual" ? "Individual" : "Organization",
                patientName: alertDetails.patientName,
                age: alertDetails.age,
                problemDescription: alertDetails.problemDescription,
                gender: alertDetails.gender,
                bloodGroup: alertDetails.bloodGroup,
                address: alertDetails.address,
                dateOfRequirement: alertDetails.dateOfRequirement,
                expiryTime: combinedDate,
                currentLocation: {
                    type: "Point",
                    coordinates: [
                        parseFloat(String(longitude)),
                        parseFloat(String(latitude)),
                    ],
                },
                patientPhoto: alertDetails.imageCloudinaryUrl,
                recipients: donorList.map((user) => ({
                    recipientId: user?._id,
                    isResponded: false,
                    invitationAccepted: false,
                })),
            });

            res.status(201).json(
                new ApiResponse(201, { alert }, "Alert created successfully")
            );

            const html = `
            <div style="text-align: center; font-family: Arial, sans-serif;">
                <h1 style="font-size: 24px; color: red; font-weight: bold;">Alert Received</h1>
                <p style="font-size: 16px; color: red; font-weight: bold;">You have received an alert from ${req.user.name} for patient named ${alert.patientName}</p>
                <p style="font-size: 16px; color: red; font-weight: bold;">Please respond to the alert in the application.</p>
                <div>
                        <p>Date of Requirement : ${alert.dateOfRequirement}</p>
                        <p>Expiry Time of Alert : ${alert.expiryTime}</p>
                        <p>Patient Name : ${alert.patientName}</p>
                        <img src="${alert.patientPhoto}" alt="${alert.patientName}" style="width:200px; height:200px;">
                        <p>Patient Blood Group : ${alert.bloodGroup}</p>
                        <p>Patient Problem Description : ${alert.problemDescription}</p>
                        <p>Patient Age : ${alert.age}</p>
                        <p>Patient Gender : ${alert.gender}</p>
                        <p>Patient Address : ${alert.address}</p>
                        <p>Patient Phone Number : ${alert.phoneNo ? alert.phoneNo : "Not Available"}</p>
                </div>
                <p style="font-size: 16px; color: red; font-weight: bold;">Thank you for your cooperation.</p>

                <p>Please do not reply to this email. If you have any questions, please contact the respective person.</p>
            </div>
        `;

            donorList.map((recipient) => {
                const emailSubject = "Alert Received";
                const emailText = `Hii ${recipient.name.split(" ")[0]}, You have received an alert from ${alert.senderId.email} for patient named ${alert.patientName}`;
                const bodyHTML = html;
                sendEmail(recipient.email, emailSubject, emailText, bodyHTML);
            });
        } else {
            return res.status(400).json({ message: "No donors selected" });
        }
    } catch (error) {
        logger.error(`Error in creating alert: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
