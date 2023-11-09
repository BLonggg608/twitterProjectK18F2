import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'

const app = express()
app.use(express.json())

const PORT = 4000
databaseService.connect()

// route localhost:3000/
app.get('/', (req, res) => {
  res.send('Hello World!!!')
})

app.use('/users', usersRouter)
//localhost:3000/users/tweets

app.use(defaultErrorHandler)

app.listen(PORT, () => {
  console.log(`Project twitter này đang chạy trên post ${PORT}`)
})
