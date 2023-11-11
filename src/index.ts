import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import 'dotenv/config'
import { config } from 'dotenv'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import { MongoClient } from 'mongodb'
config()

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 4000

initFolder()

databaseService.connect().then(() => {
  databaseService.indexUsers()
})

// route localhost:3000/
app.get('/', (req, res) => {
  res.send('Hello World!!!')
})

app.use('/users', usersRouter)
//localhost:3000/users/tweets
app.use('/medias', mediasRouter)

// app.use('/static', express.static(UPLOAD_IMAGE_DIR))
app.use('/static', staticRouter)
// app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`Project twitter này đang chạy trên post ${PORT}`)
})
