import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createEvent } from "../controllers/event/createEvent.js";
import {
    registerByDoctor,
    registerBySelf,
} from "../controllers/event/registerForEvent.js";
import {
    getAllEventsForOrganization,
    getAllUpcomingEventsForIndividual,
    getDonorsAttendedByDoctor,
    getEventDetails,
    getEventsForDoctor,
    getRegisteredEventsOfIndividual,
} from "../controllers/event/showAndDeleteEvent.js";
import { updateEvent } from "../controllers/event/updateEvent.js";

const router = Router();

router.route("/create").post(verifyJWT, createEvent);
router.route("/update-event").put(verifyJWT, updateEvent);
router.route("/register-by-doctor").post(verifyJWT, registerByDoctor);
router.route("/register-by-self").post(verifyJWT, registerBySelf);
router
    .route("/get-upcoming-events")
    .get(verifyJWT, getAllUpcomingEventsForIndividual);
router.route("/get-events").get(verifyJWT, getAllEventsForOrganization);
router
    .route("/get-registered-events")
    .get(verifyJWT, getRegisteredEventsOfIndividual);

router.route("/get-events-of-doctor").get(verifyJWT, getEventsForDoctor);
router.route("/get-event-details").get(verifyJWT, getEventDetails);
router.route("/get-attended-donors").get(verifyJWT, getDonorsAttendedByDoctor);
export default router;
