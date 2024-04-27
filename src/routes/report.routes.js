import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createBloodReport } from "../controllers/bloodReports/createBloodReport";
import { updateReport } from "../controllers/bloodReports/updateBloodReport";

const router = Router();

router.post("/create",verifyJWT, createBloodReport);
router.put("/update",verifyJWT,updateReport);


export default router;