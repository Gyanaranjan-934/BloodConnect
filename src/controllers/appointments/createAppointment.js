import { Appointment } from "../../models/appointment.model.js";
import { Organization } from "../../models/users/organization.model.js";
import { Individual } from "../../models/users/individual.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { sendEmail } from "../../utils/nodemailer.js";
import { logger } from "../../index.js";

export const createAppointment = asyncHandler(async (req, res) => {
    try {
        const { appointmentDate, appointmentTime, organizationId } = req.body;

        const userId = req.user._id;

        const organization = await Organization.findById(organizationId);

        if (!organization) {
            throw new ApiError(400, "Organization does not exist");
        }

        const user = await Individual.findById(userId);
        if (!user) {
            throw new ApiError(400, "User does not exist");
        }

        const appointment = await Appointment.create({
            userId,
            appointmentDate,
            appointmentTime,
            organizationId: organization._id,
        });

        user.appointments.push(appointment._id);
        await user.save();

        organization.appointments.push(appointment._id);
        await organization.save();

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    appointment,
                    "Appointment created successfully"
                )
            );
    } catch (error) {
        logger.error(`Error in creating appointment: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const getAppointments = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const pageNo = req.query.pageNo || 0;
        const appointments = await Appointment.find({
            organizationId: userId,
        })
            .populate("userId")
            .sort({ createdAt: -1 })
            .limit(5)
            .skip(pageNo * 5);
        const totalCount = await Appointment.countDocuments();
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        appointments,
                        pageNo,
                        totalCount,
                    },
                    "Appointments fetched successfully"
                )
            );
    } catch (error) {
        logger.error(`Error in getting appointments: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const respondAppointment = asyncHandler(async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;
        const { invitationStatus } = req.body;
        const appointment = await Appointment.findById(appointmentId)
            .populate("organizationId")
            .populate("userId");
        if (!appointment) {
            throw new ApiError(404, "Appointment not found");
        }
        if (appointment.appointmentDate < new Date()) {
            throw new ApiError(400, "Appointment date is in the past");
        }
        if (
            appointment.status === "accepted" &&
            invitationStatus === "accepted"
        ) {
            throw new ApiError(
                400,
                "You have already accepted this appointment"
            );
        }
        if (
            appointment.status === "declined" &&
            invitationStatus === "declined"
        ) {
            throw new ApiError(
                400,
                "You have already declined this appointment"
            );
        }
        appointment.status =
            invitationStatus === "accepted" ? "accepted" : "declined";
        await appointment.save();

        res.status(200).json(
            new ApiResponse(
                200,
                appointment,
                "Appointment updated successfully"
            )
        );

        if (appointment.status === "accepted") {
            const emailSubject = "Appointment Confirmation";
            const emailText = `Hii ${appointment.userId.name}, You have accepted the appointment for ${appointment.organizationId.name} on ${appointment.appointmentDate}`;
            const bodyHTML = `
                <div style="font-family: Arial, sans-serif;">
                    <h1 style="font-size: 24px; color: black; font-weight: bold;">Appointment Confirmation</h1>
                    <p style="font-size: 16px; color: black; font-weight: bold;">We have accepted the appointment for you on ${appointment.appointmentDate}</p>
                    <p style="font-size: 16px; color: black; font-weight: bold;">Thank you for your cooperation.</p>
                    <p>If you have not created the appointment by yourself, please report us at <a href="mailto:gyanaranjansahoo509@gmail.com">gyanaranjansahoo509@gmail.com</a></p>
                </div>
            `;
            sendEmail(
                appointment.userId.email,
                emailSubject,
                emailText,
                bodyHTML
            );
        }
        
    } catch (error) {
        logger.error(`Error in accepting appointment: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});

export const deleteAppointment = asyncHandler(async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointment = await Appointment.findByIdAndDelete(appointmentId);
        if (!appointment) {
            throw new ApiError(404, "Appointment not found");
        }
        // delete if from the organization and individual
        const individual = await Individual.findById(appointment.userId);
        if (individual) {
            await individual.appointments.deleteOne({ _id: appointment._id });
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Appointment deleted successfully"));
    } catch (error) {
        logger.error(`Error in deleting appointment: ${error}`);
        res.status(error?.statusCode || 500).json({
            message: error?.message || "Internal Server Error",
        });
    }
});
