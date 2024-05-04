import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getDoctors, searchDoctor } from "../controllers/auth/searchDoctors.js";
const router = Router();

router.route("/search-doctor").get(verifyJWT, searchDoctor);
router.route("/get-doctors").get(verifyJWT, getDoctors);

export default router;