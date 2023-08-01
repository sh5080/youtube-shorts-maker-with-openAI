import { Router } from "express";
import * as quoteController from "../../controllers/quoteController";
import { validateRequestBody } from "../middlewares/validateRequest";

const router = Router();

/** open AI 프롬프트 json에 저장 */
router.post(
  "/chat",
  validateRequestBody(["keyword", "count"]),
  quoteController.searchQuotes
);

/** json DB에 저장 */
router.post("/update/:keyword", quoteController.updateQuotes);
export default router;

/**DB 업데이트 */
router.post("/updateData", quoteController.updateData);
