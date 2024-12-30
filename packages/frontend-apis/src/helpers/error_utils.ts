import { ApiErrorResponse } from './errors'

export function getVisitorOrUndefined<E extends ApiErrorResponse>(
    handler: ((error: E) => void) | undefined,
    error: E
): (() => void) | undefined {
    if (handler) {
        return () => handler(error)
    } else {
        return undefined
    }
}

/**
 * This function is used to check that all cases in a switch statement are handled,
 *  and throw an error if they are not.
 */
export const unmatchedCase = (x: never): never => {
    throw new Error(`Unmatched case: ${x}`)
}
