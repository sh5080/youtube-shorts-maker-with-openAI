import express from "express";
import quoteRouter from "./quoteRoutes";
import videoRouter from "./videoRoutes";
import youtubeRouter from "./youtubeRoutes";

const router = express.Router();

router.use("/quotes", quoteRouter);
router.use("/videos", videoRouter);
router.use("/youtube", youtubeRouter);
export default router;
