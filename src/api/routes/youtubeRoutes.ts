import { Router } from "express";
import * as youtubeController from "../../controllers/youtubeController";
import { validateRequestBody } from "../middlewares/validateRequest";

const router = Router();

router.get("/login", youtubeController.youtubeLogin);
router.get("/auth/callback", youtubeController.getOauthToken);

/** json DB에 저장 */
router.post(
  "/upload",
  validateRequestBody(["video", "title", "description"]),
  youtubeController.uploadVideo
);

export default router;
