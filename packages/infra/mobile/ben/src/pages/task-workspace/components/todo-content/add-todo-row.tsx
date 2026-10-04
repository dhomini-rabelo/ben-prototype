import { Plus } from 'lucide-react-native'
import { useState } from 'react'
import { TextInput, View } from 'react-native'
import { onSurfaceVariant } from '@/layout/utils/colors'
import { useTaskTodosStore } from '@/pages/task-workspace/stores/task-todos-store'

const ON_SURFACE_VARIANT_70 = 'rgba(68, 71, 72, 0.7)'

export function AddTodoRow() {
  const addTodo = useTaskTodosStore((s) => s.addTodo)
  const [value, setValue] = useState('')

  function commit() {
    const trimmed = value.trim()
    if (!trimmed) {
      return
    }
    void addTodo(trimmed)
    setValue('')
  }

  return (
    <View className="flex-row items-center gap-3 rounded-lg px-2 py-2.5">
      <View className="size-5 shrink-0 items-center justify-center rounded-md border border-dashed border-outline-variant">
        <Plus size={12} strokeWidth={2} color={onSurfaceVariant} />
      </View>
      <TextInput
        value={value}
        placeholder="add item"
        placeholderTextColor={ON_SURFACE_VARIANT_70}
        onChangeText={setValue}
        onSubmitEditing={commit}
        onBlur={commit}
        returnKeyType="done"
        blurOnSubmit={false}
        className="flex-1 bg-transparent text-body-md text-on-surface"
      />
    </View>
  )
}
