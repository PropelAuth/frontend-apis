import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    ApiErrorResponse,
    ErrorCode,
    GenericErrorResponse,
    UnexpectedErrorResponse,
    UserAccountLockedErrorResponse,
    UserNotFoundErrorResponse,
} from '../../helpers/errors'
import { Visitor, makeRequest } from '../../helpers/request'
import { LoginState } from './types'

/////////////////
///////////////// Request
/////////////////
export type EmailPasswordLoginRequest = {
    email: string
    password: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface EmailPasswordLoginRequestBadRequestResponse extends ApiErrorResponse {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        email: string
    }
    field_errors: {
        email: string
    }
}

type NoEmailProvidedError = GenericErrorResponse & {
    error_code: ErrorCode.BadRequest
}

type PasswordLoginDisabledError = GenericErrorResponse & {
    error_code: ErrorCode.ActionDisabled
}

type UserAccountDisabledError = GenericErrorResponse & {
    error_code: ErrorCode.UserAccountDisabled
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type EmailPasswordLoginSuccessResponse = {
    login_state: LoginState
}

export type EmailPasswordLoginErrorResponse =
    | EmailPasswordLoginRequestBadRequestResponse
    | UnexpectedErrorResponse
    | NoEmailProvidedError
    | PasswordLoginDisabledError
    | UserAccountDisabledError
    | UserAccountLockedErrorResponse
    | UserNotFoundErrorResponse

/////////////////
///////////////// Visitor
/////////////////
type EmailPasswordLoginVisitor = Visitor & {
    success: (data: EmailPasswordLoginSuccessResponse) => void
    badRequest?: (error: EmailPasswordLoginRequestBadRequestResponse) => void
    noEmailProvided?: (error: NoEmailProvidedError) => void
    passwordLoginDisabled?: (error: PasswordLoginDisabledError) => void
    userAccountDisabled?: (error: UserAccountDisabledError) => void
    userAccountLocked?: (error: UserAccountLockedErrorResponse) => void
    userNotFound?: (error: UserNotFoundErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const emailPasswordLogin = (authUrl: string) => async (request: EmailPasswordLoginRequest) => {
    return makeRequest<EmailPasswordLoginVisitor, EmailPasswordLoginErrorResponse, EmailPasswordLoginSuccessResponse>({
        authUrl,
        path: '/login',
        method: 'POST',
        body: request,
        parseResponseAsJson: true,
        responseToSuccessHandler: (response, visitor) => {
            return () => visitor.success(response)
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.InvalidRequestFields:
                    return getVisitorOrUndefined(visitor.badRequest, error)
                case ErrorCode.UnexpectedError:
                    return getVisitorOrUndefined(visitor.unexpectedOrUnhandled, error)
                case ErrorCode.BadRequest:
                    return getVisitorOrUndefined(visitor.noEmailProvided, error)
                case ErrorCode.ActionDisabled:
                    return getVisitorOrUndefined(visitor.passwordLoginDisabled, error)
                case ErrorCode.UserAccountDisabled:
                    return getVisitorOrUndefined(visitor.userAccountDisabled, error)
                case ErrorCode.UserAccountLocked:
                    return getVisitorOrUndefined(visitor.userAccountLocked, error)
                case ErrorCode.UserNotFound:
                    return getVisitorOrUndefined(visitor.userNotFound, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
