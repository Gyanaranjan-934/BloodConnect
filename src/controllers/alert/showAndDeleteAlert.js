import { Alert } from "../../models/alert.model.js";
import { Individual } from "../../models/users/individual.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { logger } from "../../index.js";

export const showSenderCreatedAlerts = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        
        const alert = await Alert.find({
            senderId: userId,
        }).sort({ createdAt: -1 });
        
        // if (!alert || !alert.senderId.equals(req.user._id)) {
        //     throw new ApiError(
        //         401,
        //         "Either you are not the owner of the alert or the alert does not exist"
        //     );
        // }

        return res.status(200).json(new ApiResponse(200, alert, "Alert found"));
    } catch (error) {
        logger.error(`Error in getting sender created alerts: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

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
        logger.error(`Error in getting recipient received alerts: ${error}`);
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

        const respondedAlerts = alerts.receivedAlerts.filter((alert) => {
            const receiver = alert.recipients.find(
                (r) => r.recipientId.equals(receiptantId)
            );
            return receiver.isResponded;
        });

        return res
            .status(200)
            .json(new ApiResponse(200, respondedAlerts, "Alert found"));
    } catch (error) {
        logger.error(`Error in getting responded alerts: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const deleteAlertBySender = asyncHandler(async (req, res) => {
    try {
        const { alertId } = req.query;
        
        const alert = await Alert.findById(alertId);
        
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
        logger.error(`Error in deleting alert by sender: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const deleteAlertByRecipient = asyncHandler(async (req, res) => {
    try {
        const { alertId } = req.query;
        const alert = await Alert.findById(alertId);
        
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
        logger.error(`Error in deleting alert by recipient: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
