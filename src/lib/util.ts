const debounceState = new Map<CallableFunction, number>()
export function debounce(callable: CallableFunction, waitTime: number) {
  const id = debounceState.get(callable)
  if (id !== undefined) {
    clearTimeout(id)
  }
  debounceState.set(
    callable,
    setTimeout(() => {
      callable()
      debounceState.delete(callable)
    }, waitTime)
  )
}
