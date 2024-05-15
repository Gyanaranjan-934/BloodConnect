import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    registerAsDoctor,
    registerIndividual,
    registerOrganization,
} from "../controllers/auth/registerController.js";
import {
    loginDoctor,
    loginIndividual,
    loginOrganization,
} from "../controllers/auth/loginController.js";
import {
    doctorDashboardController,
    individualDashboardController,
    organizationDashboardController,
} from "../controllers/auth/dashboardController.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { updateIndividualProfile, updateOrganizationProfile } from "../controllers/auth/editProfile.js";
import { editIndividualAvatar } from "../controllers/auth/editAvatar.js";

const router = Router();

router.post("/individual/register", registerIndividual);
router.post("/organization/register", registerOrganization);
router.post("/doctor/register", registerAsDoctor);
router.route("/login/individual").post(loginIndividual);
router.route("/login/organization").post(loginOrganization);
router.route("/login/doctor").post(loginDoctor);

// protected routes
router.get("/dashboard/individual", verifyJWT, individualDashboardController);
router.get(
    "/dashboard/organization",
    verifyJWT,
    organizationDashboardController
);
router.route("/dashboard/doctor").get(verifyJWT, doctorDashboardController);


router.put("/edit-profile/individual", verifyJWT, updateIndividualProfile);
router.put("/edit-profile/organization", verifyJWT, updateOrganizationProfile);
router.route("/upload-avatar/individual").patch(verifyJWT, upload.single("avatar"), editIndividualAvatar);

export default router;
