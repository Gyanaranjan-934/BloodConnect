import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import {registerIndividual} from '../controllers/auth/registerController.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import loginUser from '../controllers/auth/loginController.js';

const router = Router();

router.post("/individual/register", upload.single("avatar"), registerIndividual);
router.post("/organization/register", registerIndividual);
router.route("/login").post(loginUser);

export default router;
