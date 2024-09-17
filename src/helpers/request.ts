import { ApiErrorResponse } from './errors'

const BASE_PATH = '/api/fe/v3'

type GenericRequestArgs<E extends ApiErrorResponse, V extends Visitor> = {
    authUrl: string
    path: string
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
    responseToErrorHandler: (result: E, visitor: V) => (() => void) | undefined
    parseResponseAsJson?: boolean
}

type VoidFunction = Promise<void> | void

export type RequestArgsWithArgs<S, E extends ApiErrorResponse, V extends Visitor> = GenericRequestArgs<E, V> & {
    responseToSuccessHandler: (response: S, visitor: V) => () => void
    parseResponseAsJson: true
}

export type RequestArgsWithNoArgs<E extends ApiErrorResponse, V extends Visitor> = GenericRequestArgs<E, V> & {
    responseToSuccessHandler: (visitor: V) => () => void
    parseResponseAsJson?: false
}

export type RequestArgs<S, E extends ApiErrorResponse, V extends Visitor> =
    | RequestArgsWithArgs<S, E, V>
    | RequestArgsWithNoArgs<E, V>

export type Visitor = {
    unexpectedOrUnhandled?: () => void
}

interface ResponseHandler<V extends Visitor> {
    // A handler for both success and error responses
    handle: (visitor: V) => VoidFunction
}

export type SuccessfulResponse<V extends Visitor, S = undefined> = ResponseHandler<V> & {
    ok: true
    response?: S
}

export type ErrorResponse<V extends Visitor, E> = ResponseHandler<V> & {
    ok: false
    error: E
}

export type Response<V extends Visitor, E extends ApiErrorResponse, S = undefined> =
    | SuccessfulResponse<V, S>
    | ErrorResponse<V, E>

export const makeRequest = async <V extends Visitor, E extends ApiErrorResponse, S = undefined>(
    args: RequestArgs<S, E, V>
): Promise<Response<V, E, S>> => {
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
        if (args.parseResponseAsJson) {
            const jsonResponse = (await response.json()) as S
            return {
                ok: true,
                response: jsonResponse,
                handle: (visitor: V) => {
                    const handler = args.responseToSuccessHandler(jsonResponse, visitor)
                    return handler()
                },
            }
        } else {
            return {
                ok: true,
                handle: (visitor: V) => {
                    const handler = args.responseToSuccessHandler(visitor)
                    return handler()
                },
            }
        }
    } else {
        const error = (await response.json()) as E
        return {
            ok: false,
            error,
            handle: (visitor: V) => {
                const handler = args.responseToErrorHandler(error, visitor)
                if (handler) {
                    return handler()
                } else if (visitor.unexpectedOrUnhandled) {
                    return visitor.unexpectedOrUnhandled()
                } else {
                    console.error(`No error handler for: ${error.error_code}`)
                }
            },
        }
    }
}
