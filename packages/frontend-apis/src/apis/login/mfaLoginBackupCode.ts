import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    ErrorCode,
    IncorrectMfaCodeErrorResponse,
    MfaAccountLockedErrorResponse,
    MfaSessionTimeoutErrorResponse,
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

/////////////////
///////////////// Success and Error Responses
/////////////////
export type MfaLoginBackupCodeSuccessResponse = {
    login_state: LoginState
}

export type MfaLoginBackupCodeErrorResponse =
    | UnexpectedErrorResponse
    | MfaSessionTimeoutErrorResponse
    | MfaAccountLockedErrorResponse
    | UserAccountDisabledErrorResponse
    | IncorrectMfaCodeErrorResponse

/////////////////
///////////////// Visitor
/////////////////
export type MfaLoginBackupCodeVisitor = Visitor & {
    success: (data: MfaLoginBackupCodeSuccessResponse) => void
    invalidCode?: (error: IncorrectMfaCodeErrorResponse) => void
    mfaCookieTimeout?: (error: MfaSessionTimeoutErrorResponse) => void
    accountLocked?: (error: MfaAccountLockedErrorResponse) => void
    accountDisabled?: (error: UserAccountDisabledErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type VerifyMfaBackupCodeForLoginFn = ReturnType<typeof verifyMfaBackupCodeForLogin>

export const verifyMfaBackupCodeForLogin = (authUrl: string) => async (request: MfaLoginBackupCodeRequest) => {
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
                case ErrorCode.InvalidMfaCookie:
                    return getVisitorOrUndefined(visitor.mfaCookieTimeout, error)
                case ErrorCode.UserAccountMfaLocked:
                    return getVisitorOrUndefined(visitor.accountLocked, error)
                case ErrorCode.UserAccountDisabled:
                    return getVisitorOrUndefined(visitor.accountDisabled, error)
                case ErrorCode.IncorrectMfaCode:
                    return getVisitorOrUndefined(visitor.invalidCode, error)
                case ErrorCode.UnexpectedError:
                    return getVisitorOrUndefined(visitor.unexpectedOrUnhandled, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
