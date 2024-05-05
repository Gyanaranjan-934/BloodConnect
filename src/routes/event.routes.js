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
    getRegisteredEventsOfIndividual,
} from "../controllers/event/showAndDeleteEvent.js";

const router = Router();

router.route("/create").post(verifyJWT, createEvent);
router.route("/register-by-doctor").put(verifyJWT, registerByDoctor);
router.route("/register-by-self").post(verifyJWT, registerBySelf);
router
    .route("/get-upcoming-events")
    .get(verifyJWT, getAllUpcomingEventsForIndividual);
router.route("/get-events").get(verifyJWT, getAllEventsForOrganization);
router
    .route("/get-registered-events")
    .get(verifyJWT, getRegisteredEventsOfIndividual);

export default router;
