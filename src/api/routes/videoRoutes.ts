import { Router } from "express";
import * as videoController from "../../controllers/videoController";

const router = Router();

/** json DB에 저장 */
router.post("/upload", videoController.uploadVideo);
export default router;
