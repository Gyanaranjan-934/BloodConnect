import { Router } from "express";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import {
    deleteDoctor,
    deleteEvent,
    deleteOrganization,
    getAllDoctors,
    getAllEvents,
    getAllOrganizations,
    getOrganizationDetails,
    verifyDoctor,
    verifyEvent,
    verifyOrganization,
} from "../controllers/admin/adminControllers.js";
import {
    getAdminDashboard,
    loginAdmin,
    registerAdmin,
} from "../controllers/admin/registerAdmin.js";

const router = Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/get-admin-dashboard", verifyAdmin, getAdminDashboard);
router.get("/get-all-organizations", verifyAdmin, getAllOrganizations);
router.get("/get-all-events", verifyAdmin, getAllEvents);
router.get("/get-all-doctors", verifyAdmin, getAllDoctors);
router.get(
    "/get-organization-details/:organizationId",
    verifyAdmin,
    getOrganizationDetails
);
router.patch(
    "/verify-organization/:organizationId",
    verifyAdmin,
    verifyOrganization
);
router.patch("/verify-event/:eventId", verifyAdmin, verifyEvent);
router.patch("/verify-doctor/:doctorId", verifyAdmin, verifyDoctor);
router.delete(
    "/delete-organization/:organizationId",
    verifyAdmin,
    deleteOrganization
);
router.delete("/delete-event/:eventId", verifyAdmin, deleteEvent);
router.delete("/delete-doctor/:doctorId", verifyAdmin, deleteDoctor);
export default router;
