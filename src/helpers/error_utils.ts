export function getVisitorOrUndefined<E>(
    handler: ((error: E) => void) | undefined,
    error: E
): (() => void) | undefined {
    if (handler) {
        return () => handler(error)
    } else {
        return undefined
    }
}
