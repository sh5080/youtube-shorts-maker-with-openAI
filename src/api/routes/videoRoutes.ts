import { Router } from "express";
import * as videoController from "../../controllers/videoController";
import { validateRequestBody } from "../middlewares/validateRequest";

const router = Router();

/** json DB에 저장 */
router.post(
  "/upload",
  validateRequestBody(["video", "title", "description"]),
  videoController.uploadVideo
);

router.get("/login", videoController.youtubeLogin);
router.get("/auth/callback", videoController.getOauthToken);
export default router;
