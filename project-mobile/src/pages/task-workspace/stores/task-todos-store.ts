import { create } from 'zustand'
import { randomUUID } from 'expo-crypto'
import { requestUpdateTaskTodos } from '@/api/requests/tasks'
import { nextOrder } from '@/pages/task-workspace/utils/todo-order'
import { getTaskFromCache, invalidateTask } from './task-cache'
import { useTaskStore } from './task-store'

interface TaskTodosStore {
  toggleTodo: (itemId: string) => Promise<void>
  addTodo: (title: string) => Promise<void>
}

export const useTaskTodosStore = create<TaskTodosStore>(() => ({
  toggleTodo: async (itemId) => {
    const { taskId } = useTaskStore.getState()
    const todoItems = getTaskFromCache(taskId)?.todoItems
    if (!taskId || !todoItems) {
      return
    }
    const next = todoItems.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item,
    )
    await requestUpdateTaskTodos(taskId, next)
    await invalidateTask(taskId)
  },

  addTodo: async (title) => {
    const trimmed = title.trim()
    const { taskId } = useTaskStore.getState()
    const todoItems = getTaskFromCache(taskId)?.todoItems
    if (!trimmed || !taskId || !todoItems) {
      return
    }
    const next = [
      ...todoItems,
      {
        id: randomUUID(),
        title: trimmed,
        done: false,
        order: nextOrder(todoItems),
      },
    ]
    await requestUpdateTaskTodos(taskId, next)
    await invalidateTask(taskId)
  },
}))
