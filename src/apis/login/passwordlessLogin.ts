import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    ApiErrorResponse,
    ErrorCode,
    GenericErrorResponse,
    UnexpectedErrorResponse,
    UserAccountLockedErrorResponse,
} from '../../helpers/errors'
import { Visitor, makeRequest } from '../../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type PasswordlessLoginRequest = {
    email: string
    create_if_doesnt_exist: boolean
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface PasswordlessLoginRequestBadRequestResponse extends ApiErrorResponse {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        email: string
    }
    field_errors: {
        email: string
    }
}

type PasswordlessLoginDisabledErrorResponse = GenericErrorResponse & {
    error_code: ErrorCode.NotFound
}

type CannotSignupWithPersonalEmailErrorResponse = GenericErrorResponse & {
    error_code: ErrorCode.BadRequest
}

type DomainNotAllowedErrorResponse = GenericErrorResponse & {
    error_code: ErrorCode.DomainNotAllowed
}

type UserAccountDisabledErrorResponse = GenericErrorResponse & {
    error_code: ErrorCode.UserAccountDisabled
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type PasswordlessLoginErrorResponse =
    | PasswordlessLoginRequestBadRequestResponse
    | UnexpectedErrorResponse
    | PasswordlessLoginDisabledErrorResponse
    | CannotSignupWithPersonalEmailErrorResponse
    | DomainNotAllowedErrorResponse
    | UserAccountDisabledErrorResponse
    | UserAccountLockedErrorResponse

/////////////////
///////////////// Visitor
/////////////////
export type PasswordlessLoginVisitor = Visitor & {
    success: () => void
    badRequest?: (error: PasswordlessLoginRequestBadRequestResponse) => void
    passwordlessLoginDisabled?: (error: PasswordlessLoginDisabledErrorResponse) => void
    cannotSignupWithPersonalEmail?: (error: CannotSignupWithPersonalEmailErrorResponse) => void
    domainNotAllowed?: (error: DomainNotAllowedErrorResponse) => void
    userAccountDisabled?: (error: UserAccountDisabledErrorResponse) => void
    userAccountLocked?: (error: UserAccountLockedErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type PasswordlessLoginFn = ReturnType<typeof passwordlessLogin>

export const passwordlessLogin = (authUrl: string) => async (request: PasswordlessLoginRequest) => {
    return makeRequest<PasswordlessLoginVisitor, PasswordlessLoginErrorResponse>({
        authUrl,
        path: '/login_passwordless',
        method: 'POST',
        body: request,
        responseToSuccessHandler: (visitor) => {
            return () => visitor.success()
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.InvalidRequestFields:
                    return getVisitorOrUndefined(visitor.badRequest, error)
                case ErrorCode.NotFound:
                    return getVisitorOrUndefined(visitor.passwordlessLoginDisabled, error)
                case ErrorCode.BadRequest:
                    return getVisitorOrUndefined(visitor.cannotSignupWithPersonalEmail, error)
                case ErrorCode.UnexpectedError:
                    return getVisitorOrUndefined(visitor.unexpectedOrUnhandled, error)
                case ErrorCode.DomainNotAllowed:
                    return getVisitorOrUndefined(visitor.domainNotAllowed, error)
                case ErrorCode.UserAccountDisabled:
                    return getVisitorOrUndefined(visitor.userAccountDisabled, error)
                case ErrorCode.UserAccountLocked:
                    return getVisitorOrUndefined(visitor.userAccountLocked, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
