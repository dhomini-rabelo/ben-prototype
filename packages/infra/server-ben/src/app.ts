import { authMiddleware } from '@ben/server-ben/middlewares/auth'
import { errorHandler } from '@ben/server-ben/middlewares/error-handler'
import { getAgentPreferences } from '@ben/server-ben/routes/agent-preferences/get-agent-preferences'
import { updateAgentPreferences } from '@ben/server-ben/routes/agent-preferences/update-agent-preferences'
import { getUserPreferences } from '@ben/server-ben/routes/user-preferences/get-user-preferences'
import { updateUserPreferences } from '@ben/server-ben/routes/user-preferences/update-user-preferences'
import { loginOrRegister } from '@ben/server-ben/routes/auth/login-or-register'
import { getCapturesCounts } from '@ben/server-ben/routes/captures/get-captures-counts'
import { chat } from '@ben/server-ben/routes/chat'
import { getMessageTrace } from '@ben/server-ben/routes/messages/get-message-trace'
import { listMessages } from '@ben/server-ben/routes/messages/list-messages'
import { getNoteDetail } from '@ben/server-ben/routes/notes/get-note-detail'
import { listNotes } from '@ben/server-ben/routes/notes/list-notes'
import { registerPushDevice } from '@ben/server-ben/routes/push-devices/register-push-device'
import { sendTestPush } from '@ben/server-ben/routes/push-devices/send-test-push'
import { acknowledgeReminder } from '@ben/server-ben/routes/reminders/acknowledge-reminder'
import { getDailySummary } from '@ben/server-ben/routes/reminders/get-daily-summary'
import { getSnoozeOptions } from '@ben/server-ben/routes/reminders/get-snooze-options'
import { updateReminder } from '@ben/server-ben/routes/reminders/update-reminder'
import { getReminderDetail } from '@ben/server-ben/routes/reminders/get-reminder-detail'
import { listReminders } from '@ben/server-ben/routes/reminders/list-reminders'
import { approveTaskDiff } from '@ben/server-ben/routes/tasks/approve-task-diff'
import { createTaskMessage } from '@ben/server-ben/routes/tasks/create-task-message'
import { finishTask } from '@ben/server-ben/routes/tasks/finish-task'
import { getTaskDetail } from '@ben/server-ben/routes/tasks/get-task-detail'
import { listTasks } from '@ben/server-ben/routes/tasks/list-tasks'
import { rejectTaskDiff } from '@ben/server-ben/routes/tasks/reject-task-diff'
import { reopenTask } from '@ben/server-ben/routes/tasks/reopen-task'
import { updateTaskContent } from '@ben/server-ben/routes/tasks/update-task-content'
import { updateTaskTodos } from '@ben/server-ben/routes/tasks/update-task-todos'
import { transcription } from '@ben/server-ben/routes/transcription'
import { HttpStatus } from '@ben/modules-utils'
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
    origin: [
      'https://dev-dhomini.remktos.com',
      'http://localhost:3001',
      'http://localhost:8081',
    ],
    exposedHeaders: ['updatedjwtauthenticationtoken'],
  }),
  urlencoded({ extended: true, limit: '100mb' }),
)
app.use(json({ limit: '100mb' }))

app.get('/health', (_req, response) => {
  return response.status(HttpStatus.OK).json({ status: 'ok' })
})

app.post('/auth/login-or-register', loginOrRegister)

app.get('/messages/list', authMiddleware, listMessages)
app.get('/messages/:id/trace', authMiddleware, getMessageTrace)
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
app.get('/reminders/daily-summary', authMiddleware, getDailySummary)
app.get('/reminders/:id/detail', authMiddleware, getReminderDetail)
app.get('/reminders/:id/snooze-options', authMiddleware, getSnoozeOptions)
app.post('/reminders/:id/update', authMiddleware, updateReminder)
app.post('/reminders/:id/acknowledge', authMiddleware, acknowledgeReminder)

app.get('/captures/counts', authMiddleware, getCapturesCounts)

app.get('/agent-preferences/detail', authMiddleware, getAgentPreferences)
app.post('/agent-preferences/update', authMiddleware, updateAgentPreferences)
app.get('/user-preferences/detail', authMiddleware, getUserPreferences)
app.post('/user-preferences/update', authMiddleware, updateUserPreferences)

app.post('/push-devices/register', authMiddleware, registerPushDevice)
app.post('/push-devices/test', authMiddleware, sendTestPush)

app.use(errorHandler)

export default app
