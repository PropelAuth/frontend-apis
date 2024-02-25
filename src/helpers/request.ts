import { ErrorResponse } from './errors'

const BASE_PATH = '/api/fe/v3'

export type RequestArgs<R extends Response<V>, V extends Visitor> = {
    authUrl: string
    path: string
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
    responseToHandler: (result: R, visitor: V) => (() => Promise<void> | void) | undefined
    hasJsonResponse?: boolean
}

export type Visitor = {
    success: () => Promise<void> | void
    unexpectedOrUnhandled?: () => Promise<void> | void
}

export interface Response<V extends Visitor> {
    // Whether the request was successful or not
    ok: boolean

    // A handler for both success and error responses
    handle: (visitor: V) => Promise<void>
}

export interface SuccessfulResponse<V extends Visitor> extends Response<V> {
    ok: true
}

export const makeRequest = async <S extends SuccessfulResponse<V>, E extends ErrorResponse<V>, V extends Visitor>(
    args: RequestArgs<S | E, V>
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
        if (args.hasJsonResponse === false) {
            return {
                ok: true,
                handle: (visitor: V) => visitor.success(),
            } as S
        }
        const res = (await response.json()) as S
        return {
            ...res,
            ok: true,
            handle: (visitor: V) => visitor.success(),
        }
    } else {
        const error = (await response.json()) as E
        return {
            ...error,

            ok: false,
            handle: (visitor: V) => {
                const handler = args.responseToHandler(error, visitor)
                if (handler) {
                    return handler()
                } else if (visitor.unexpectedOrUnhandled) {
                    return visitor.unexpectedOrUnhandled()
                } else {
                    console.error(`No error handler for: ${error.error_code}`)
                }
            },
        } as E
    }
}
