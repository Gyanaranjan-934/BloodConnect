import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createBloodReport } from "../controllers/bloodReports/createBloodReport.js";
import { updateReport } from "../controllers/bloodReports/updateBloodReport.js";
import { getBloodReports } from "../controllers/bloodReports/showBloodReports.js";

const router = Router();

router.post("/fill-blood-report", verifyJWT, createBloodReport);
router.put("/update", verifyJWT, updateReport);
router.get("/get-blood-reports", verifyJWT, getBloodReports);

export default router;
