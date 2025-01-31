import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    ApiErrorForSpecificFields,
    ErrorCode,
    MfaAccountLockedErrorResponse,
    MfaSessionTimeoutErrorResponse,
    UnexpectedErrorResponse,
    UserAccountDisabledErrorResponse,
} from '../../helpers/errors'
import { makeRequest, Visitor } from '../../helpers/request'
import { LoginState } from './types'

export type VerifyMfaForLogin = {
    code: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface MfaLoginBadRequestResponse extends ApiErrorForSpecificFields {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        code: string
    }
    field_errors: {
        code: string
    }
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type MfaLoginSuccessResponse = {
    login_state: LoginState
}

export type MfaLoginErrorResponse =
    | MfaLoginBadRequestResponse
    | UnexpectedErrorResponse
    | MfaSessionTimeoutErrorResponse
    | MfaAccountLockedErrorResponse
    | UserAccountDisabledErrorResponse

/////////////////
///////////////// Visitor
/////////////////
export type MfaLoginVisitor = Visitor & {
    success: (data: MfaLoginSuccessResponse) => void
    badRequest?: (error: MfaLoginBadRequestResponse) => void
    mfaCookieTimeout?: (error: MfaSessionTimeoutErrorResponse) => void
    accountLocked?: (error: MfaAccountLockedErrorResponse) => void
    accountDisabled?: (error: UserAccountDisabledErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type VerifyMfaForLoginFn = ReturnType<typeof verifyMfaForLogin>

export const verifyMfaForLogin = (authUrl: string) => async (request: VerifyMfaForLogin) => {
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
                case ErrorCode.InvalidMfaCookie:
                    return getVisitorOrUndefined(visitor.mfaCookieTimeout, error)
                case ErrorCode.UserAccountMfaLocked:
                    return getVisitorOrUndefined(visitor.accountLocked, error)
                case ErrorCode.UserAccountDisabled:
                    return getVisitorOrUndefined(visitor.accountDisabled, error)
                case ErrorCode.UnexpectedError:
                    return getVisitorOrUndefined(visitor.unexpectedOrUnhandled, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
