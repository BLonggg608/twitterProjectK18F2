import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import { userService } from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  TokenPayload,
  VerifyEmailReqBody,
  ResetPasswordReqBody,
  UpdateMeReqBody,
  GetProfileReqParams,
  FollowReqBody,
  UnfollowReqParams,
  ChangePasswordReqBody
} from '~/models/requests/User.requests'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enums'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  // lấy user_id từ req.user
  const user = req.user as User
  const user_id = user._id as ObjectId
  // dùng user_id tạo access_token và refresh_token
  const result = await userService.login({ user_id: user_id.toString(), verify: user.verify })
  // res trả về access_token và refresh_token cho client
  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
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

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  // logout sẽ nhận refresh_token để tìm và xóa
  const result = await userService.logout(refresh_token)
  res.json(result)
}

export const emailVerifyTokenController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response
) => {
  // nếu mà code vào đc đây nghĩa là email_verify_token hợp lệ
  // và mình đã lấy đc decoded_email_verify_token
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  // dựa vào user_id tìm user và xem thử nó đã verify chưa?
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (user === null) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  // nếu mà user đã verify rồi thì ko cần verify nữa
  if (user.verify === UserVerifyStatus.Verified && user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  // nếu mà user bị banned thì ko cho verify
  if (user.verify === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_BANNED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }
  // nếu mà user chưa verify thì phải verify
  if (user.email_verify_token !== req.body.email_verify_token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INCORRECT,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  // nếu mà xuống đc đây có nghĩa là user chưa verify
  // mình sẽ udpate lại user đó
  const result = await userService.verifyEmail(user_id)
  res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendEmailVerifyTokenController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response
) => {
  // nếu vào đc đây có nghĩa là accessToken hợp lệ
  // và mình đã lấy đc decoded_authorization
  const { user_id } = req.decoded_authorization as TokenPayload
  // dựa vào user_id tìm user và xem thử nó đã verify chưa?
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (user === null) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified && user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  if (user.verify === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_BANNED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }
  // user này thật sự chưa verify
  // mình sẽ gửi lại email_verify_token cho user này
  // và update lại user
  const result = await userService.resendVerifyEmail(user_id)
  return res.json(result)
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  // lấy user_id từ req.user
  const { _id, verify } = req.user as User
  // dùng _id tìm và cập nhật lại user thêm vào forget_password_token
  const result = await userService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify })
  return res.json(result)
}

export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  // muốn đổi mật khẩu thì cần user_id, password mới
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  // cập nhật
  const result = await userService.resetPassword({ user_id, password })
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
  // muốn lấy profile của mình thì có user_id của mình
  const { user_id } = req.decoded_authorization as TokenPayload
  // dùng user_id tìm user
  const user = await userService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result: user
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  // muốn update thì cần user_id, và các thông tin cần update
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  // update lại user
  const user = await userService.updateMe({ user_id, payload: body })
  return res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result: user
  })
}

export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response) => {
  // tìm user theo username
  const { username } = req.params
  const user = await userService.getProfile(username)
  return res.json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    result: user
  })
}

export const followController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload //user_id của người đang đăng nhập
  const { followed_user_id } = req.body //user_id của người mà ngta muốn follow
  const result = await userService.follow(user_id, followed_user_id)
  return res.json(result)
}

export const unfollowController = async (req: Request<UnfollowReqParams>, res: Response, next: NextFunction) => {
  // lấy ra user_id người muốn thực hiện hành động unfollow
  const { user_id } = req.decoded_authorization as TokenPayload
  // lấy ra user_id của người mà ngta muốn unfollow
  const { user_id: followed_user_id } = req.params
  // gọi hàm unfollow
  const result = await userService.unfollow(user_id, followed_user_id) //user_id của người đang đăng nhập, user_id của người mà ngta muốn unfollow
  return res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload //lấy user_id từ decoded_authorization của access_token
  const { password } = req.body //lấy old_password và password từ req.body
  const result = await userService.changePassword(user_id, password) //chưa code changePassword
  return res.json(result)
}
