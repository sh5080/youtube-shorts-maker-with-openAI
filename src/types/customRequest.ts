// import { JwtPayload } from 'jsonwebtoken';
import { Request } from "express";

export interface CustomRequest extends Request {
  // user?: JwtPayload & { username: string; role: string };
  // params: {
  //   username?: string;
  //   id?: string;
  //   diaryId?: string;
  //   planId?: string;
  //   date?: string;
  //   locationId?: string;
  //   commentId?: string;
  // };
  body: {
    // id: number;
    // username: string;
    // password: string;
    // name: string;
    // email: string;
    message: string;
    keyword: string;
    count: number;
  };
}
