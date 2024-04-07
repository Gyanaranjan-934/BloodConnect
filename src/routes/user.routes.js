import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import {registerAsDoctor, registerIndividual, registerOrganization} from '../controllers/auth/registerController.js';
import {loginAdmin, loginIndividual,loginOrganization} from '../controllers/auth/loginController.js';

const router = Router();

router.post("/individual/register", upload.single("avatar"), registerIndividual);
router.post("/organization/register", registerOrganization);
router.post("/doctor/register",upload.single("avatar"),registerAsDoctor)
router.route("/login/individual").post(loginIndividual);
router.route("/login/organization").post(loginOrganization);
router.route("/login/admin").post(loginAdmin);

export default router;
