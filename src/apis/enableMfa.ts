import { getVisitorOrUndefined } from '../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    ErrorResponse,
    ErrorVisitor,
    GenericErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../helpers/errors'
import { makeRequest } from '../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type MfaEnableRequest = {
    code: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface MfaEnableBadRequestResponse<V extends ErrorVisitor> extends ErrorResponse<V> {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        code: string
    }
    field_errors: {
        code: string
    }
}

export interface MfaAlreadyEnabledResponse<V extends ErrorVisitor> extends GenericErrorResponse<V> {
    error_code: ErrorCode.ActionAlreadyComplete
    user_facing_error: string
}

export interface MfaIncorrectCodeResponse<V extends ErrorVisitor> extends GenericErrorResponse<V> {
    error_code: ErrorCode.Forbidden
    user_facing_error: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type MfaEnableErrorResponse =
    | MfaEnableBadRequestResponse<MfaEnableErrorVisitor>
    | MfaAlreadyEnabledResponse<MfaEnableErrorVisitor>
    | MfaIncorrectCodeResponse<MfaEnableErrorVisitor>
    | UnauthorizedResponse<MfaEnableErrorVisitor>
    | UnexpectedErrorResponse<MfaEnableErrorVisitor>
    | EmailNotConfirmedResponse<MfaEnableErrorVisitor>

export type MfaEnableSuccessResponse = {
    ok: true
}

/////////////////
///////////////// Error Visitor
/////////////////
export interface MfaEnableErrorVisitor extends ErrorVisitor {
    badRequest: (error: MfaEnableBadRequestResponse<MfaEnableErrorVisitor>) => void
    alreadyEnabled: (error: MfaAlreadyEnabledResponse<MfaEnableErrorVisitor>) => void
    incorrectCode: (error: MfaIncorrectCodeResponse<MfaEnableErrorVisitor>) => void

    // These are generic error responses that can occur on any request
    unauthorized?: (error: UnauthorizedResponse<MfaEnableErrorVisitor>) => void
    emailNotConfirmed?: (error: EmailNotConfirmedResponse<MfaEnableErrorVisitor>) => void
    unexpectedOrUnhandled?: () => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const enableMfa = (authUrl: string) => async (request: MfaEnableRequest) => {
    return makeRequest<MfaEnableSuccessResponse, MfaEnableErrorResponse, MfaEnableErrorVisitor>({
        authUrl,
        path: '/mfa_enable',
        method: 'POST',
        body: request,
        errorToHandler: (error, visitor) => {
            switch (error.error_code) {
                case ErrorCode.InvalidRequestFields:
                    return getVisitorOrUndefined(visitor.badRequest, error)
                case ErrorCode.ActionAlreadyComplete:
                    return getVisitorOrUndefined(visitor.alreadyEnabled, error)
                case ErrorCode.Forbidden:
                    return getVisitorOrUndefined(visitor.incorrectCode, error)
                case ErrorCode.Unauthorized:
                    return getVisitorOrUndefined(visitor.unauthorized, error)
                case ErrorCode.EmailNotConfirmed:
                    return getVisitorOrUndefined(visitor.emailNotConfirmed, error)
                case ErrorCode.UnexpectedError:
                    return visitor.unexpectedOrUnhandled
            }
        },
    })
}
