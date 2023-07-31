import { Router } from "express";
import * as userController from "../../controllers/quoteController";
import { validateRequestBody } from "../middlewares/validateRequest";

const router = Router();

/** open AI 프롬프트 json에 저장 */
router.post(
  "/chat",
  validateRequestBody(["keyword", "count"]),
  userController.searchQuotes
);

/** json DB에 저장 */
router.post("/update/:keyword", userController.updateQuotes);
export default router;
