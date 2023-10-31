import { Router } from 'express'
import {
  emailVerifyTokenController,
  loginController,
  logoutController,
  registerController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const userRoute = Router()

/*
des: đăng nhập
path: /users/login
method: POST
body: {email, password}
*/
userRoute.get('/login', loginValidator, wrapAsync(loginController))

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

/*
des: đăng xuất
path: /users/logout
method: POST
headers: {Authorization: 'Bearer <access_token>'}
body: {refresh_token: string}
*/
userRoute.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

/*
des: verify email token
khi người dùng đăng ký họ sẽ nhận đc mail có link dạng
https://localhost:3000/users/verify-email?token=<email7_verify_token>
nếu mà em nhấp vào link thì sẽ tạo ra 1 request gửi email_verify_token lên server
server ktra email_verify_token có hợp lệ hay ko
thì từ decoded_email_verify_token lấy ra user_id
và vào user_id đó để update lại email_verified_token thành '', verify = 1, update_at
path: /users/verify-email
method: POST
body: {email_verify_token: string}
*/
userRoute.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyTokenController))

export default userRoute
