import { Request, Response, NextFunction } from 'express';
import { AppError,CommonError } from '../../types/AppError';

export const validateRequestBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestBody = req.body;

    const missingFields: string[] = [];
    const unexpectedFields: string[] = [];

    for (const field of requiredFields) {
      if (!(field in requestBody) || !requestBody[field]) {
        missingFields.push(field);
      } else if (Object.keys(requestBody).length > requiredFields.length) {
        unexpectedFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      throw new AppError(
        CommonError.INVALID_INPUT,
        `필수 입력값이 누락되었습니다: ${missingFields.join(', ')}`,
        400
      );
    }

    if (unexpectedFields.length > 0) {
      throw new AppError(
        CommonError.INVALID_INPUT,
        `유효하지 않은 입력이 포함되었습니다: ${unexpectedFields.join(', ')}만 입력이 가능합니다.`,
        400
      );
    }
    
    next();
  };
};
