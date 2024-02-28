import { getVisitorOrUndefined } from '../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    ApiErrorResponse,
    GenericErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../helpers/errors'
import { SuccessfulResponse, ErrorResponse, Visitor, makeRequest } from '../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type MfaEnableRequest = {
    code: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface MfaEnableBadRequestResponse extends ApiErrorResponse {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        code: string
    }
    field_errors: {
        code: string
    }
}

export interface MfaAlreadyEnabledResponse extends GenericErrorResponse {
    error_code: ErrorCode.ActionAlreadyComplete
    user_facing_error: string
}

export interface MfaIncorrectCodeResponse extends GenericErrorResponse {
    error_code: ErrorCode.Forbidden
    user_facing_error: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type MfaEnableErrorResponse =
    | MfaEnableBadRequestResponse
    | MfaAlreadyEnabledResponse
    | MfaIncorrectCodeResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse

/////////////////
///////////////// Error Visitor
/////////////////
export interface MfaEnableVisitor extends Visitor {
    success: () => Promise<void> | void
    badRequest: (error: MfaEnableBadRequestResponse) => Promise<void> | void
    alreadyEnabled: (error: MfaAlreadyEnabledResponse) => Promise<void> | void
    incorrectCode: (error: MfaIncorrectCodeResponse) => Promise<void> | void

    // These are generic error responses that can occur on any request
    unauthorized?: (error: UnauthorizedResponse) => Promise<void> | void
    emailNotConfirmed?: (error: EmailNotConfirmedResponse) => Promise<void> | void
}

/////////////////
///////////////// The actual Request
/////////////////
export const enableMfa = (authUrl: string) => async (request: MfaEnableRequest) => {
    return makeRequest<
        SuccessfulResponse<MfaEnableVisitor>,
        MfaEnableErrorResponse,
        ErrorResponse<MfaEnableVisitor, MfaEnableErrorResponse>,
        MfaEnableVisitor
    >({
        authUrl,
        path: '/mfa_enable',
        method: 'POST',
        body: request,
        responseToSuccessHandler: (visitor) => {
            return async () => await visitor.success()
        },
        responseToErrorHandler: (error, visitor) => {
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
