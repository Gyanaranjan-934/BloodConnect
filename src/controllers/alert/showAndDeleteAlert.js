import { Alert } from "../../models/alert.model.js";
import { Individual } from "../../models/users/individual.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const showSenderCreatedAlerts = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        console.log(userId);
        const alert = await Alert.find({
            senderId: userId,
        }).sort({ createdAt: -1 });
        console.log(alert);
        // if (!alert || !alert.senderId.equals(req.user._id)) {
        //     throw new ApiError(
        //         401,
        //         "Either you are not the owner of the alert or the alert does not exist"
        //     );
        // }

        return res.status(200).json(new ApiResponse(200, alert, "Alert found"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

// export const showRecipientReceivedAlerts = asyncHandler(async (req, res) => {
//     try {
//         const userId = req.user._id;

//         // const alerts = await Individual.findById(userId).populate("receivedAlerts");

//         const alerts = await Alert.find({
//             recipients: {
//                 $elemMatch: { recipientId: userId },
//             },
//         }).sort({ createdAt: -1 });
//         // check if the alert is expired

//         // const unExpiredAlerts = alerts.receivedAlerts.filter((alert) => {
//         //     const expiryDate = new Date(alert.expiryTime);
//         //     return expiryDate >= new Date.now();
//         // });

//         return res
//             .status(200)
//             .json(new ApiResponse(200, alerts, "Alert found"));
//     } catch (error) {
//         res.status(error?.statusCode || 500).json({
//             message: error?.message || "Internal Server Error",
//         });
//     }
// });

export const showRecipientReceivedAlerts = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const alerts = await Alert.find({
            recipients: {
                $elemMatch: { recipientId: userId },
            },
        }).sort({ createdAt: -1 });

        // Iterate over each alert and update its status field with filtered recipient status
        const updatedAlerts = alerts.map(alert => {
            const recipient = alert.recipients.find(recipient => recipient.recipientId.equals(userId));
            if (recipient) {
                return {
                    ...alert.toObject(), // Convert Mongoose document to plain JavaScript object
                    status: {
                        invitationAccepted: recipient.invitationAccepted,
                        isResponded: recipient.isResponded
                    }
                };
            }
            return alert.toObject();
        });

        return res.status(200).json(new ApiResponse(200, updatedAlerts, "Alerts found"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});


export const showRespondedAlerts = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        const alerts =
            await Individual.findById(userId).populate("receivedAlerts");

        // check if the alert is expired

        const respondedAlerts = alerts.receivedAlerts.filter((alert) => {
            const receiver = alert.recipients.find(
                (r) => r.recipientId.equals(receiptantId)
            );
            return receiver.isResponded;
        });

        return res
            .status(200)
            .json(new ApiResponse(200, unExpiredAlerts, "Alert found"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const deleteAlertBySender = asyncHandler(async (req, res) => {
    try {
        const { alertId } = req.query;
        console.log(req.user);
        const alert = await Alert.findById(alertId);
        console.log(alert);
        if (!alert || !alert.senderId.equals(req.user._id)) {
            throw new ApiError(
                401,
                "Either you are not the owner of the alert or the alert does not exist"
            );
        }

        await Alert.deleteOne({ _id: alertId });

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Alert deleted successfully"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const deleteAlertByRecipient = asyncHandler(async (req, res) => {
    try {
        const { alertId } = req.query;
        const alert = await Alert.findById(alertId);
        console.log(alert);
        if (
            !alert ||
            !alert.recipients.find((r) => r.recipientId.equals(req.user._id))
        ) {
            throw new ApiError(
                401,
                "Either you are not the owner of the alert or the alert does not exist"
            );
        }
        alert.recipients = alert.recipients.filter(
            (r) => !r.recipientId.equals(req.user._id)
        );
        await alert.save();
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Alert deleted successfully"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
