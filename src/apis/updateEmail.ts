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
export type UpdateEmailRequest = {
    new_email: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface UpdateEmailBadRequestResponse extends ApiErrorResponse {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        new_email: string
    }
    field_errors: {
        new_email: string
    }
}

export interface OrgRestrictionErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.Forbidden
    user_facing_error: string
}

export interface EmailAlreadySentResponse extends GenericErrorResponse {
    error_code: ErrorCode.ConfirmationEmailAlreadySentRecently
    user_facing_error: string
}

export interface DisabledResponse extends GenericErrorResponse {
    error_code: ErrorCode.ActionDisabled
    user_facing_error: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type UpdateEmailErrorResponse =
    | UpdateEmailBadRequestResponse
    | OrgRestrictionErrorResponse
    | EmailAlreadySentResponse
    | DisabledResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse

/////////////////
///////////////// Error Visitor
/////////////////
export interface UpdateEmailVisitor extends Visitor {
    success: () => Promise<void> | void

    badRequest: (error: UpdateEmailBadRequestResponse) => Promise<void> | void
    cannotChangeEmailDueToOrgMembership: (error: OrgRestrictionErrorResponse) => Promise<void> | void
    rateLimit: (error: EmailAlreadySentResponse) => Promise<void> | void
    emailChangeDisabled?: (error: DisabledResponse) => Promise<void> | void

    // These are generic error responses that can occur on any request
    unauthorized?: (error: UnauthorizedResponse) => Promise<void> | void
    emailNotConfirmed?: (error: EmailNotConfirmedResponse) => Promise<void> | void
}

/////////////////
///////////////// The actual Request
/////////////////
export const updateEmail = (authUrl: string) => async (request: UpdateEmailRequest) => {
    return makeRequest<
        SuccessfulResponse<UpdateEmailVisitor>,
        UpdateEmailErrorResponse,
        ErrorResponse<UpdateEmailVisitor, UpdateEmailErrorResponse>,
        UpdateEmailVisitor
    >({
        authUrl,
        path: '/update_email',
        method: 'POST',
        body: request,
        responseToSuccessHandler: (visitor) => {
            return async () => await visitor.success()
        },
        responseToErrorHandler: (error, visitor) => {
            switch (error.error_code) {
                case ErrorCode.InvalidRequestFields:
                    return getVisitorOrUndefined(visitor.badRequest, error)
                case ErrorCode.Forbidden:
                    return getVisitorOrUndefined(visitor.cannotChangeEmailDueToOrgMembership, error)
                case ErrorCode.ConfirmationEmailAlreadySentRecently:
                    return getVisitorOrUndefined(visitor.rateLimit, error)
                case ErrorCode.ActionDisabled:
                    return getVisitorOrUndefined(visitor.emailChangeDisabled, error)
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
