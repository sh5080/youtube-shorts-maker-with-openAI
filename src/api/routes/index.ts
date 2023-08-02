import express from "express";
import quoteRouter from "./quoteRoutes";
import videoRouter from "./videoRoutes";

const router = express.Router();

router.use("/quotes", quoteRouter);
router.use("/videos", videoRouter);
export default router;
