import { ErrorResponse, ErrorVisitor } from './errors'

const BASE_PATH = '/api/fe/v3'

export type RequestArgs<E extends ErrorResponse<V>, V extends ErrorVisitor> = {
    authUrl: string
    path: string
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
    errorToHandler: (error: E, visitor: V) => (() => void) | undefined
}

export type SuccessfulResponse = {
    ok: true
}

export const makeRequest = async <S extends SuccessfulResponse, E extends ErrorResponse<V>, V extends ErrorVisitor>(
    args: RequestArgs<E, V>
): Promise<S | E> => {
    const response = await fetch(`${args.authUrl}${BASE_PATH}${args.path}`, {
        method: args.method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': '-.-',
        },
        body: args.body ? JSON.stringify(args.body) : undefined,
    })

    if (response.ok) {
        return response.json() as Promise<S>
    } else {
        const error = (await response.json()) as E
        return {
            ...error,

            ok: false,
            handleError: (visitor: V) => {
                const handler = args.errorToHandler(error, visitor)
                if (handler) {
                    handler()
                } else if (visitor.unexpectedOrUnhandled) {
                    visitor.unexpectedOrUnhandled()
                } else {
                    console.error(`No error handler for: ${error.error_code}`)
                }
            },
        } as E
    }
}
