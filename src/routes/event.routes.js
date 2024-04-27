import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createEvent } from "../controllers/event/createEvent";
import { registerByDoctor, registerBySelf } from "../controllers/event/registerForEvent";

const router = Router();

router.route("/create").post(verifyJWT,createEvent); 
router.route("/register-by-doctor").put(verifyJWT,registerByDoctor);
router.route("/register-by-self").post(verifyJWT,registerBySelf);


export default router;