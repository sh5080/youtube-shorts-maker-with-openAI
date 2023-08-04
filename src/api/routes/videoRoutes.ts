import { Router } from "express";
import * as videoController from "../../controllers/videoController";
// import { validateRequestBody } from "../middlewares/validateRequest";

const router = Router();

router.post("/", videoController.createVideo);

export default router;
