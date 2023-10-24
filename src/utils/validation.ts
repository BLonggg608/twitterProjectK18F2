import { Request, Response, NextFunction } from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { EntityErrors, ErrorWithStatus } from '~/models/Errors'
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    const errorObject = errors.mapped()
    const entityErrors = new EntityErrors({ errors: {} })
    // xử lý errorObject
    for (const key in errorObject) {
      // lấy msg của từng lỗi
      const { msg } = errorObject[key]
      // nếu msg có dạng ErrorWithStatus và status !== 422 thì ném về error handler
      if (msg instanceof ErrorWithStatus && msg.status !== 422) {
        return next(msg)
      }

      // lưu các lỗi 422 từ errorObject vào entityErrors
      entityErrors.errors[key] = msg
    }

    // ở đây nó xử lý lỗi luôn chứ ko ném về error handler tổng
    next(entityErrors)
  }
}
