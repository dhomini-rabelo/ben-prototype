import { errorHandler } from '@/infra/http/error-handler'
import { loginOrRegister } from '@/infra/http/routes/login-or-register'
import cors from 'cors'
import Express, { json, urlencoded } from 'express'

const app = Express()

app.use(cors(), urlencoded({ extended: true, limit: '100mb' }))
app.use(json({ limit: '100mb' }))

app.get('/health', (_req, res) => {
  return res.status(200).json({ status: 'ok' })
})

app.post('/auth/login-or-register', loginOrRegister)

app.use(errorHandler)

export default app
