import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import { ApiErrorForSpecificFields, ApiErrorResponse, ErrorCode, UnexpectedErrorResponse } from '../helpers/errors'
import { Visitor, makeRequest } from '../helpers/request'
import { LoginState } from './login/types'

export type SignupRequest = {
    email: string
    password: string
    username?: string
    first_name?: string
    last_name?: string
    properties?: { [key: string]: unknown }
    invite_token?: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type SignupSuccessResponse = {
    login_state: LoginState
    user_id: string
}

export interface SignupBadRequestResponse extends ApiErrorForSpecificFields {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        email?: string
        password?: string
        username?: string
        first_name?: string
        last_name?: string
    } & { [key: string]: string }
    field_errors: {
        email?: string
        password?: string
        username?: string
        first_name?: string
        last_name?: string
    } & { [key: string]: string }
}

export interface SignupDisabledError extends ApiErrorResponse {
    error_code: ErrorCode.ActionDisabled
}

export type SignupErrorResponse = SignupBadRequestResponse | SignupDisabledError | UnexpectedErrorResponse

/////////////////
///////////////// Error Visitor
/////////////////
export type SignupVisitor = Visitor & {
    success: (data: SignupSuccessResponse) => void
    badRequest?: (error: SignupBadRequestResponse) => void
    signupDisabled?: (error: SignupDisabledError) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type SignupFn = ReturnType<typeof signup>

export const signup = (authUrl: string) => async (request: SignupRequest) => {
    return makeRequest<SignupVisitor, SignupErrorResponse, SignupSuccessResponse>({
        authUrl,
        path: `/signup`,
        parseResponseAsJson: true,
        method: 'POST',
        body: request,
        responseToSuccessHandler: (response, visitor) => {
            return () => visitor.success(response)
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.InvalidRequestFields:
                    return getVisitorOrUndefined(visitor.badRequest, error)
                case ErrorCode.ActionDisabled:
                    return getVisitorOrUndefined(visitor.signupDisabled, error)
                case ErrorCode.UnexpectedError:
                    return getVisitorOrUndefined(visitor.unexpectedOrUnhandled, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
