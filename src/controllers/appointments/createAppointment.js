// export const createAppointment = asyncHandler(async (req, res) => {
//     try {
//         const { patientName, patientPhoneNo, appointmentDate, appointmentTime } = req.body;

//         const appointment = await Appointment.create({
//             patientName,
//             patientPhoneNo,
//             appointmentDate,
//             appointmentTime,
//         });

//         return res.status(201).json(new ApiResponse(201, appointment, "Appointment created successfully"));
//     } catch (error) {
//         res.status(error?.statusCode || 500).json({
//             message: error?.message || "Internal Server Error",
//         });
//     }
// });