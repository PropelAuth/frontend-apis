import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    ApiErrorResponse,
    EmailNotConfirmedResponse,
    ErrorCode,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
    UserAccountDisabledErrorResponse,
} from '../../helpers/errors'
import { makeRequest, Visitor } from '../../helpers/request'
import { LoginState } from './types'

export type MfaLoginRequest = {
    code: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface MfaLoginBadRequestResponse extends ApiErrorResponse {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        code: string
    }
    field_errors: {
        code: string
    }
}

export interface MfaSessionTimeoutErrorResponse extends ApiErrorResponse {
    error_code: ErrorCode.InvalidMfaCookie
}

export interface MfaAccountLockedErrorResponse extends ApiErrorResponse {
    error_code: ErrorCode.UserAccountMfaLocked
}

export interface IncorrectMfaCodeErrorResponse extends ApiErrorResponse {
    error_code: ErrorCode.IncorrectMfaCode
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type MfaLoginSuccessResponse = {
    login_state: LoginState
}

export type MfaLoginErrorResponse =
    | MfaLoginBadRequestResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | MfaSessionTimeoutErrorResponse
    | MfaAccountLockedErrorResponse
    | UserAccountDisabledErrorResponse
    | IncorrectMfaCodeErrorResponse

/////////////////
///////////////// Visitor
/////////////////
type MfaLoginVisitor = Visitor & {
    success: (data: MfaLoginSuccessResponse) => void
    badRequest?: (error: MfaLoginBadRequestResponse) => void
    invalidCode?: (error: IncorrectMfaCodeErrorResponse) => void
    sessionTimeout?: (error: MfaSessionTimeoutErrorResponse) => void
    accountLocked?: (error: MfaAccountLockedErrorResponse) => void
    accountDisabled?: (error: UserAccountDisabledErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const verifyMfaForLogin = (authUrl: string) => async (request: MfaLoginRequest) => {
    return makeRequest<MfaLoginVisitor, MfaLoginErrorResponse, MfaLoginSuccessResponse>({
        authUrl,
        path: '/verify',
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
                case ErrorCode.Unauthorized:
                    return getVisitorOrUndefined(visitor.unauthorized, error)
                case ErrorCode.InvalidMfaCookie:
                    return getVisitorOrUndefined(visitor.sessionTimeout, error)
                case ErrorCode.UserAccountMfaLocked:
                    return getVisitorOrUndefined(visitor.accountLocked, error)
                case ErrorCode.UserAccountDisabled:
                    return getVisitorOrUndefined(visitor.accountDisabled, error)
                case ErrorCode.IncorrectMfaCode:
                    return getVisitorOrUndefined(visitor.invalidCode, error)
                case ErrorCode.EmailNotConfirmed:
                    return getVisitorOrUndefined(visitor.emailNotConfirmed, error)
                case ErrorCode.UnexpectedError:
                    return getVisitorOrUndefined(visitor.unexpectedOrUnhandled, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
