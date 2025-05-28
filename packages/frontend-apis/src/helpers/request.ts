import { ApiErrorResponse, EmailNotConfirmedResponse, UnauthorizedResponse, ErrorCode } from './errors'

type GenericRequestArgs<E extends ApiErrorResponse, V extends Visitor> = {
    authUrl: string
    path: string
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
    queryParams?: URLSearchParams
    responseToErrorHandler: (result: E, visitor: V) => (() => void) | undefined
    parseResponseAsJson?: boolean
}

export type RequestArgsWithArgs<S, E extends ApiErrorResponse, V extends Visitor> = GenericRequestArgs<E, V> & {
    responseToSuccessHandler: (response: S, visitor: V) => () => S | void
    parseResponseAsJson: true
}

export type RequestArgsWithNoArgs<E extends ApiErrorResponse, V extends Visitor> = GenericRequestArgs<E, V> & {
    responseToSuccessHandler: (visitor: V) => () => void
    parseResponseAsJson?: false
}

export type RequestArgs<S, E extends ApiErrorResponse, V extends Visitor> =
    | RequestArgsWithArgs<S, E, V>
    | RequestArgsWithNoArgs<E, V>

export type LoggedInVisitor = {
    unauthorized?: (error: UnauthorizedResponse) => void
    emailNotConfirmed?: (error: EmailNotConfirmedResponse) => void
} & Visitor

export type Visitor = {
    unexpectedOrUnhandled?: (error: ApiErrorResponse) => void
}

interface ResponseHandler<V extends Visitor, S = undefined> {
    // A handler for both success and error responses
    handle: (visitor: V) => Promise<void | S> | void | S
}

export type SuccessfulResponse<V extends Visitor, S = undefined> = ResponseHandler<V, S> & {
    ok: true
    data: S
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
    const {
        authUrl,
        parseResponseAsJson,
        method,
        body,
        path,
        queryParams,
        responseToSuccessHandler,
        responseToErrorHandler,
    } = args
    const url = `${authUrl}${path}${queryParams ? `?${queryParams.toString()}` : ''}`

    try {
        const response = await fetch(url, {
            method: method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': '-.-',
            },
            body: body ? JSON.stringify(body) : undefined,
        })

        if (response.ok) {
            if (parseResponseAsJson) {
                const jsonResponse = (await response.json()) as S
                return {
                    ok: true,
                    data: jsonResponse,
                    handle: (visitor: V) => {
                        const handler = responseToSuccessHandler(jsonResponse, visitor)
                        return handler()
                    },
                }
            } else {
                return {
                    ok: true,
                    data: undefined as S,
                    handle: (visitor: V) => {
                        const handler = responseToSuccessHandler(visitor)
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
                    const handler = responseToErrorHandler(error, visitor)
                    if (handler) {
                        return handler()
                    } else if (visitor.unexpectedOrUnhandled) {
                        return visitor.unexpectedOrUnhandled(error)
                    } else {
                        console.error(`No error handler for: ${error.error_code}`)
                    }
                },
            }
        }
    } catch {
        const unexpectedError = {
            error_code: ErrorCode.UnexpectedError,
            user_facing_error: 'An unexpected error has occurred',
        } as E

        return {
            ok: false,
            error: unexpectedError,
            handle: (visitor: V) => {
                if (visitor.unexpectedOrUnhandled) {
                    return visitor.unexpectedOrUnhandled(unexpectedError)
                } else {
                    console.error(`No error handler for: ${unexpectedError.error_code}`)
                }
            },
        }
    }
}
