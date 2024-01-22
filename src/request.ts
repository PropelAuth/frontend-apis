import { ErrorResponse, ErrorVisitor } from './errors'

// TODO: Make configurable
const AUTH_URL = 'https://auth.propelauth.com'
const BASE_PATH = '/api/fe/v3'

export type RequestArgs = {
    path: string
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
}

export type SuccessfulResponse = {
    ok: true
}

export const makeRequest = async <S extends SuccessfulResponse, E extends ErrorResponse<V>, V extends ErrorVisitor>(
    args: RequestArgs
): Promise<S | E> => {
    const response = await fetch(`${AUTH_URL}${BASE_PATH}${args.path}`, {
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
        const error = await response.json()
        return {
            ...error,

            ok: false,
            handleError: (visitor: V) => {
                const handler = visitor[error.error_code]
                if (handler) {
                    handler(error as S)
                    return
                }

                const genericHandler = visitor['unexpectedOrUnhandled']
                if (genericHandler) {
                    genericHandler()
                } else {
                    console.error(`No error handler for: ${error.error_code}`)
                }
            },
        } as E
    }
}
