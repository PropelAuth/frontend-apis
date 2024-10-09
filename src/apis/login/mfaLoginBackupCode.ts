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

export type MfaLoginBackupCodeRequest = {
    code: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface MfaSessionTimeoutErrorResponse extends ApiErrorResponse {
    error_code: ErrorCode.InvalidMfaCookie
}

export interface MfaAccountLockedResponse extends ApiErrorResponse {
    error_code: ErrorCode.UserAccountMfaLocked
}

export interface IncorrectMfaCodeResponse extends ApiErrorResponse {
    error_code: ErrorCode.IncorrectMfaCode
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type MfaLoginBackupCodeSuccessResponse = {
    login_state: LoginState
}

export type MfaLoginBackupCodeErrorResponse =
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | MfaSessionTimeoutErrorResponse
    | MfaAccountLockedResponse
    | UserAccountDisabledErrorResponse
    | IncorrectMfaCodeResponse

/////////////////
///////////////// Visitor
/////////////////
type MfaLoginBackupCodeVisitor = Visitor & {
    success: (data: MfaLoginBackupCodeSuccessResponse) => void
    invalidCode?: (error: IncorrectMfaCodeResponse) => void
    sessionTimeout?: (error: MfaSessionTimeoutErrorResponse) => void
    accountLocked?: (error: MfaAccountLockedResponse) => void
    accountDisabled?: (error: UserAccountDisabledErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const mfaLoginBackupCode = (authUrl: string) => async (request: MfaLoginBackupCodeRequest) => {
    return makeRequest<MfaLoginBackupCodeVisitor, MfaLoginBackupCodeErrorResponse, MfaLoginBackupCodeSuccessResponse>({
        authUrl,
        path: '/verify_backup',
        method: 'POST',
        body: request,
        parseResponseAsJson: true,
        responseToSuccessHandler: (response, visitor) => {
            return () => visitor.success(response)
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
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
