import express, { Application, Request, Response } from "express";
import router from "../api/routes/index";

const routeLoader = (app: Application): Application => {
  app.get("/", (req: Request, res: Response) => {
    res.send("hello world");
  });

  /** 정적 파일 경로 */
  app.use("/static", express.static("public"));

  /** 라우팅 */
  app.use(router);
  return app;
};

export default routeLoader;
