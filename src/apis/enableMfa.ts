import { getVisitorOrUndefined } from '../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    ErrorResponse,
    GenericErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../helpers/errors'
import { SuccessfulResponse, Visitor, makeRequest } from '../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type MfaEnableRequest = {
    code: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface MfaEnableBadRequestResponse<V extends Visitor> extends ErrorResponse<V> {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        code: string
    }
    field_errors: {
        code: string
    }
}

export interface MfaAlreadyEnabledResponse<V extends Visitor> extends GenericErrorResponse<V> {
    error_code: ErrorCode.ActionAlreadyComplete
    user_facing_error: string
}

export interface MfaIncorrectCodeResponse<V extends Visitor> extends GenericErrorResponse<V> {
    error_code: ErrorCode.Forbidden
    user_facing_error: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type MfaEnableErrorResponse =
    | MfaEnableBadRequestResponse<MfaEnableVisitor>
    | MfaAlreadyEnabledResponse<MfaEnableVisitor>
    | MfaIncorrectCodeResponse<MfaEnableVisitor>
    | UnauthorizedResponse<MfaEnableVisitor>
    | UnexpectedErrorResponse<MfaEnableVisitor>
    | EmailNotConfirmedResponse<MfaEnableVisitor>

export type MfaEnableSuccessResponse = SuccessfulResponse<MfaEnableVisitor>

/////////////////
///////////////// Error Visitor
/////////////////
export interface MfaEnableVisitor extends Visitor {
    badRequest: (error: MfaEnableBadRequestResponse<MfaEnableVisitor>) => Promise<void> | void
    alreadyEnabled: (error: MfaAlreadyEnabledResponse<MfaEnableVisitor>) => Promise<void> | void
    incorrectCode: (error: MfaIncorrectCodeResponse<MfaEnableVisitor>) => Promise<void> | void

    // These are generic error responses that can occur on any request
    unauthorized?: (error: UnauthorizedResponse<MfaEnableVisitor>) => Promise<void> | void
    emailNotConfirmed?: (error: EmailNotConfirmedResponse<MfaEnableVisitor>) => Promise<void> | void
}

/////////////////
///////////////// The actual Request
/////////////////
export const enableMfa = (authUrl: string) => async (request: MfaEnableRequest) => {
    return makeRequest<MfaEnableSuccessResponse, MfaEnableErrorResponse, MfaEnableVisitor>({
        authUrl,
        path: '/mfa_enable',
        method: 'POST',
        body: request,
        responseToHandler: (response, visitor) => {
            if (response.ok) {
                return visitor.success
            } else {
                switch (response.error_code) {
                    case ErrorCode.InvalidRequestFields:
                        return getVisitorOrUndefined(visitor.badRequest, response)
                    case ErrorCode.ActionAlreadyComplete:
                        return getVisitorOrUndefined(visitor.alreadyEnabled, response)
                    case ErrorCode.Forbidden:
                        return getVisitorOrUndefined(visitor.incorrectCode, response)
                    case ErrorCode.Unauthorized:
                        return getVisitorOrUndefined(visitor.unauthorized, response)
                    case ErrorCode.EmailNotConfirmed:
                        return getVisitorOrUndefined(visitor.emailNotConfirmed, response)
                    case ErrorCode.UnexpectedError:
                        return visitor.unexpectedOrUnhandled
                }
            }
        },
    })
}
