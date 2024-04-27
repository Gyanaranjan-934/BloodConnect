import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { showFeeds } from "../controllers/feeds/showFeed";
import { createFeed } from "../controllers/feeds/createFeed";
import { deleteFeed, updateFeed } from "../controllers/feeds/updateAndDeleteFeed";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.get("/", verifyJWT, showFeeds); 
router.post("/create", verifyJWT,upload.array('images', 5),createFeed);
router.put("/update",verifyJWT,upload.array('images', 5),updateFeed);
router.delete("/delete",verifyJWT,deleteFeed);


export default router;