import { ApiErrorResponse } from './errors'

const BASE_PATH = '/api/fe/v3'

type GenericRequestArgs<E extends ApiErrorResponse, V extends Visitor> = {
    authUrl: string
    path: string
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
    responseToErrorHandler: (result: E, visitor: V) => (() => Promise<void> | void) | undefined
    parseResponseAsJson?: boolean
}

export type RequestArgsWithArgs<S, E extends ApiErrorResponse, V extends Visitor> = GenericRequestArgs<E, V> & {
    responseToSuccessHandler: (response: S, visitor: V) => () => Promise<void> | void
    parseResponseAsJson: true
}

export type RequestArgsWithNoArgs<E extends ApiErrorResponse, V extends Visitor> = GenericRequestArgs<E, V> & {
    responseToSuccessHandler: (visitor: V) => () => Promise<void> | void
    parseResponseAsJson?: false
}

export type RequestArgs<S, E extends ApiErrorResponse, V extends Visitor> =
    | RequestArgsWithArgs<S, E, V>
    | RequestArgsWithNoArgs<E, V>

export type Visitor = {
    unexpectedOrUnhandled?: () => Promise<void> | void
}

export interface Response<V extends Visitor> {
    // Whether the request was successful or not
    ok: boolean

    // A handler for both success and error responses
    handle: (visitor: V) => Promise<void>
}

export type SuccessfulResponse<V extends Visitor, S = undefined> = Response<V> &
    S & {
        ok: true
    }

export type ErrorResponse<V extends Visitor, E> = Response<V> &
    E & {
        ok: false
    }

export const makeRequest = async <
    SV extends SuccessfulResponse<V, S>,
    E extends ApiErrorResponse,
    EV extends ErrorResponse<V, E>,
    V extends Visitor,
    S = undefined
>(
    args: RequestArgs<S, E, V>
): Promise<SV | EV> => {
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
            const jsonResponse = await response.json()
            return {
                ...jsonResponse,
                ok: true,
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
            } as SV
        }
    } else {
        const error = (await response.json()) as E
        return {
            ...error,
            ok: false,
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
        } as EV
    }
}
