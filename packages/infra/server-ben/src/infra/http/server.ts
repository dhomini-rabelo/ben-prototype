import app from '@/infra/http/app'
import { env } from '@/infra/services/env'

async function bootstrap() {
  app.listen(env.API_PORT, () => {
    console.log(`Server is running on port ${env.API_PORT}`)
  })
}

bootstrap()
