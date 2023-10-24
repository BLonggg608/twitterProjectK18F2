import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { userService } from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests'

export const loginController = async (req: Request, res: Response) => {
  // lấy user_id từ req.user
  const { user }: any = req
  const user_id = user._id
  // dùng user_id tạo access_token và refresh_token
  const result = await userService.login(user_id.toString())
  // res trả về access_token và refresh_token cho client
  res.json({
    message: 'login successfully',
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  // tạo 1 user mới và bỏ vào collection users trong database
  const result = await userService.register(req.body)
  res.json({
    message: 'register successfully',
    result
  })
}
