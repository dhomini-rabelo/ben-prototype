import { useMutation } from '@tanstack/react-query'

interface UseAPIMutationProps<TVariables, TData> {
  mutationFn: (variables: TVariables) => Promise<TData>
}

export function useAPIMutation<TVariables, TData>({
  mutationFn,
}: UseAPIMutationProps<TVariables, TData>) {
  const { mutateAsync, isPending, isError, error, reset } = useMutation<
    TData,
    Error,
    TVariables
  >({
    mutationFn,
  })

  return {
    actions: {
      mutate: mutateAsync,
      reset,
    },
    state: {
      isPending,
      isError,
      error,
    },
  }
}
