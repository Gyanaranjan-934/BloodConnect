import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    registerAsDoctor,
    registerIndividual,
    registerOrganization,
} from "../controllers/auth/registerController.js";
import {
    loginAdmin,
    loginDoctor,
    loginIndividual,
    loginOrganization,
} from "../controllers/auth/loginController.js";
import {
    individualDashboardController,
    organizationDashboardController,
} from "../controllers/auth/dashboardController.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/individual/register",
    upload.single("avatar"),
    registerIndividual
);
router.post("/organization/register", registerOrganization);
router.post("/doctor/register", upload.single("avatar"), registerAsDoctor);
router.route("/login/individual").post(loginIndividual);
router.route("/login/organization").post(loginOrganization);
router.route("/login/admin").post(loginAdmin);
router.route("/login/doctor").post(loginDoctor);

// protected routes
router.get("/dashboard/individual", verifyJWT, individualDashboardController);
router.get(
    "/dashboard/organization",
    verifyJWT,
    organizationDashboardController
);
export default router;
