import { Alert } from "../../models/alert.model.js";
import { Individual } from "../../models/users/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const showSenderCreatedAlerts = asyncHandler(async (req, res) => {
    try {
        const alert = await Alert.findById({
            senderId: req.user._id,
        });
        if (!alert || alert.senderId !== req.user._id) {
            throw new ApiError(
                401,
                "Either you are not the owner of the alert or the alert does not exist"
            );
        }

        return res.status(200).json(new ApiResponse(200, alert, "Alert found"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const showRecipientReceivedAlerts = asyncHandler(async (req, res) => {
    try {
        
        const userId = req.user._id;

        const alerts = await Individual.findById(userId).populate("receivedAlerts");

        // check if the alert is expired

        const unExpiredAlerts = alerts.receivedAlerts.filter((alert) => {
            const expiryDate = new Date(alert.expiryTime);
            return expiryDate >= new Date.now();
        });

        return res.status(200).json(new ApiResponse(200, unExpiredAlerts, "Alert found"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const showRespondedAlerts = asyncHandler(async (req, res) => {
    try {
        
        const userId = req.user._id;

        const alerts = await Individual.findById(userId).populate("receivedAlerts");

        // check if the alert is expired

        const respondedAlerts = alerts.receivedAlerts.filter((alert) => {
            const receiver = alert.recipients.find((r) => r.receiptantId === req.user._id);
            return receiver.isResponded;
        });

        return res.status(200).json(new ApiResponse(200, unExpiredAlerts, "Alert found"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const deleteAlert = asyncHandler(async (req, res) => {
    try {
        const { alertId } = req.body;
        const alert = await Alert.findById(alertId);
        if (!alert || alert.senderId !== req.user._id) {
            throw new ApiError(
                401,
                "Either you are not the owner of the alert or the alert does not exist"
            );
        }

        await alert.delete();

        return res.status(200).json(new ApiResponse(200, {}, "Alert deleted successfully"));
    } catch (error) {
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});