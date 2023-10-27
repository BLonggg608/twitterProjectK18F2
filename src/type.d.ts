// file này dùng để định nghĩa lại request truyền lên từ client
import { Request } from 'express'
import User from './models/schemas/User.schema'
import { TokenPlayload } from './models/requests/User.requests'

declare module 'express' {
  interface Request {
    user?: User //trong 1 request có thể có hoặc không có user
    decoded_authorization?: TokenPlayload
    decoded_refresh_token?: TokenPlayload
  }
}
