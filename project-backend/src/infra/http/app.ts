import { authMiddleware } from '@/infra/http/middlewares/auth'
import { errorHandler } from '@/infra/http/middlewares/error-handler'
import { loginOrRegister } from '@/infra/http/routes/auth/login-or-register'
import { getCapturesCounts } from '@/infra/http/routes/captures/get-captures-counts'
import { chat } from '@/infra/http/routes/chat'
import { listMessages } from '@/infra/http/routes/messages/list-messages'
import { getNoteDetail } from '@/infra/http/routes/notes/get-note-detail'
import { listNotes } from '@/infra/http/routes/notes/list-notes'
import { getReminderDetail } from '@/infra/http/routes/reminders/get-reminder-detail'
import { listReminders } from '@/infra/http/routes/reminders/list-reminders'
import { approveTaskDiff } from '@/infra/http/routes/tasks/approve-task-diff'
import { createTaskMessage } from '@/infra/http/routes/tasks/create-task-message'
import { finishTask } from '@/infra/http/routes/tasks/finish-task'
import { getTaskDetail } from '@/infra/http/routes/tasks/get-task-detail'
import { listTasks } from '@/infra/http/routes/tasks/list-tasks'
import { rejectTaskDiff } from '@/infra/http/routes/tasks/reject-task-diff'
import { reopenTask } from '@/infra/http/routes/tasks/reopen-task'
import { updateTaskContent } from '@/infra/http/routes/tasks/update-task-content'
import { updateTaskTodos } from '@/infra/http/routes/tasks/update-task-todos'
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

app.get('/tasks/list', authMiddleware, listTasks)
app.get('/tasks/:id/detail', authMiddleware, getTaskDetail)
app.post('/tasks/:id/messages/create', authMiddleware, createTaskMessage)
app.post('/tasks/:id/diff/approve', authMiddleware, approveTaskDiff)
app.post('/tasks/:id/diff/reject', authMiddleware, rejectTaskDiff)
app.post('/tasks/:id/content/update', authMiddleware, updateTaskContent)
app.post('/tasks/:id/todos/update', authMiddleware, updateTaskTodos)
app.post('/tasks/:id/finish', authMiddleware, finishTask)
app.post('/tasks/:id/reopen', authMiddleware, reopenTask)

app.get('/notes/list', authMiddleware, listNotes)
app.get('/notes/:id/detail', authMiddleware, getNoteDetail)

app.get('/reminders/list', authMiddleware, listReminders)
app.get('/reminders/:id/detail', authMiddleware, getReminderDetail)

app.get('/captures/counts', authMiddleware, getCapturesCounts)

app.use(errorHandler)

export default app
