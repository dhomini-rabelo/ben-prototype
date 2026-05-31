import { authMiddleware } from '@/infra/http/middlewares/auth'
import { errorHandler } from '@/infra/http/middlewares/error-handler'
import { loginOrRegister } from '@/infra/http/routes/auth'
import { createMessage, listMessages } from '@/infra/http/routes/messages'
import { HttpStatus } from '@/modules/utils/http'
import cors from 'cors'
import Express, { json, urlencoded } from 'express'

const app = Express()

app.use(
  cors({
    origin: ['https://dev-dhomini.remktos.com', 'http://localhost:3001'],
    exposedHeaders: ['updatedjwtauthenticationtoken'],
  }),
  urlencoded({ extended: true, limit: '100mb' }),
)
app.use(json({ limit: '100mb' }))

app.get('/health', (_req, res) => {
  return res.status(HttpStatus.OK).json({ status: 'ok' })
})

app.post('/auth/login-or-register', loginOrRegister)

app.get('/messages/list', authMiddleware, listMessages)
app.post('/messages/create', authMiddleware, createMessage)

app.use(errorHandler)

export default app
