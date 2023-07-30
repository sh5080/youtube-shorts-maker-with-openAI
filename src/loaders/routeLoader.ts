import express, { Application, Request, Response } from "express";
import quoteRouter from "../api/routes/quoteRoutes";

const routeLoader = (app: Application): Application => {
  app.get("/", (req: Request, res: Response) => {
    res.send("hello world");
  });

  /** 정적 파일 경로 */
  app.use("/static", express.static("public"));

  /** 라우팅 */
  app.use("/quotes", quoteRouter);

  return app;
};

export default routeLoader;
