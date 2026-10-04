import app from '@ben/server-ben/app'
import { env } from '@ben/modules-env'

async function bootstrap() {
  app.listen(env.API_PORT, () => {
    console.log(`Server is running on port ${env.API_PORT}`)
  })
}

bootstrap()
