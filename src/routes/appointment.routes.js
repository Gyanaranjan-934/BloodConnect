import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createAppointment,
    getAppointments,
    respondAppointment,
} from "../controllers/appointments/createAppointment.js";

const router = Router();

router.post("/create", verifyJWT, createAppointment);
router.get("/get-appointments", verifyJWT, getAppointments);
router.patch(
    "/respond-appointment/:appointmentId",
    verifyJWT,
    respondAppointment
);

export default router;
