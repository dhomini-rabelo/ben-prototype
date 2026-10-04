export async function expectError<T>(
  callBackFunction: () => Promise<void>,
  expectedError: new (...args: never[]) => T,
): Promise<T> {
  try {
    await callBackFunction()
  } catch (caught) {
    const error = caught as Error
    if (error instanceof expectedError) {
      return error
    }
    throw new Error(
      `Expected error: ${expectedError.name}, received error: ${error} / Stack: ${error.stack}`,
    )
  }

  throw new Error('Error not thrown')
}
