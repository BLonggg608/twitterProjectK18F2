import { RequestHandler, Request, Response, NextFunction } from 'express'

export const wrapAsync = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // tạo ra cấu trúc try catch để bắt lỗi
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
