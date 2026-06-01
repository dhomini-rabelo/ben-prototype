import { authMiddleware } from '@/infra/http/middlewares/auth'
import { errorHandler } from '@/infra/http/middlewares/error-handler'
import { loginOrRegister } from '@/infra/http/routes/auth'
import { chat } from '@/infra/http/routes/chat'
import { listMessages } from '@/infra/http/routes/messages'
import { transcription } from '@/infra/http/routes/transcription'
import { HttpStatus } from '@/modules/utils/http'
import cors from 'cors'
import Express, { json, urlencoded } from 'express'
import multer from 'multer'

const app = Express()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
})

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
app.post('/chat', authMiddleware, chat)
app.post(
  '/transcription',
  authMiddleware,
  upload.single('audio'),
  transcription,
)

app.use(errorHandler)

export default app
