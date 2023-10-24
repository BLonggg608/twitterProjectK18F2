import { Router } from 'express'
import { register } from 'module'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const userRoute = Router()

/*
des: đăng nhập
path: /users/login
method: POST
body: {email, password}
*/
userRoute.get('/login', loginValidator, loginController)

/*
Descrtiption: Register new user
Path: /register
Method: POST
BODY: {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string theo chuẩn ISO 8601
}
*/
userRoute.post('/register', registerValidator, wrapAsync(registerController))

export default userRoute
