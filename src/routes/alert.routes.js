import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAlert, getDonorListAndCreateAlert } from "../controllers/alert/createAlert.js";
import { upload } from "../middlewares/multer.middleware.js";
import { searchDonors } from "../controllers/alert/searchDonors.js";
import { deleteAlertByRecipient, deleteAlertBySender, showRecipientReceivedAlerts, showSenderCreatedAlerts } from "../controllers/alert/showAndDeleteAlert.js";
import { respondAlert, updateAlert, updateAlertReceiptantBySender } from "../controllers/alert/updateAlert.js";

const router = Router();

router.post("/create",verifyJWT,upload.single("patientImage"),createAlert);
router.get("/find-donors",verifyJWT,searchDonors);
router.route("/get-created-alerts").get(verifyJWT,showSenderCreatedAlerts);
router.route("/get-received-alerts").get(verifyJWT,showRecipientReceivedAlerts);
router.route("/update-alert").put(verifyJWT,upload.single("patientImage"),updateAlert);
router.route("/update-receipient").put(verifyJWT,updateAlertReceiptantBySender);
router.route("/respond-alert").put(verifyJWT,respondAlert);
router.route("/get-donors-list").post(verifyJWT,getDonorListAndCreateAlert);
router.route("/delete-alert-by-sender").delete(verifyJWT,deleteAlertBySender);
router.route("/delete-alert-by-recipient").delete(verifyJWT,deleteAlertByRecipient);

export default router;