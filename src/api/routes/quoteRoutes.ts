import { Router } from "express";
import * as userController from "../../controllers/quoteController";
import { validateRequestBody } from "../middlewares/validateRequest";

const router = Router();

router.post("/message", userController.searchOrator);
/** [인증] 명언 생성 */
router.post("/", validateRequestBody(["orator"]), userController.createQuotes);

export default router;
