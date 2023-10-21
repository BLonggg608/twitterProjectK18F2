import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { userService } from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'test@gmail.com' && password === '123456') {
    res.json({
      data: [
        { name: 'Điệp', yob: 1999 },
        { name: 'Hùng', yob: 2003 },
        { name: 'Được', yob: 1994 }
      ]
    })
  } else {
    res.status(400).json({
      message: 'login failed'
    })
  }
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  try {
    // tạo 1 user mới và bỏ vào collection users trong database
    const result = await userService.register(req.body)
    res.json({
      message: 'register successfully',
      result
    })
  } catch (error) {
    return res.status(400).json({
      message: 'register failed',
      error
    })
  }
}
