import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import {
    ApiErrorForSpecificFields,
    EmailNotConfirmedResponse,
    ErrorCode,
    GenericErrorResponse,
    IncorrectPasswordResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../helpers/errors'
import { LoggedInVisitor, makeRequest } from '../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type UpdateEmailRequest = {
    password?: string
    new_email: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface UpdateEmailBadRequestResponse extends ApiErrorForSpecificFields {
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
}

export interface EmailAlreadySentResponse extends GenericErrorResponse {
    error_code: ErrorCode.ConfirmationEmailAlreadySentRecently
}

export interface DisabledResponse extends GenericErrorResponse {
    error_code: ErrorCode.ActionDisabled
}

export interface FailedToSendEmailResponse extends GenericErrorResponse {
    error_code: ErrorCode.EmailSendFailure
}

export interface UserAccountLockedResponse extends GenericErrorResponse {
    error_code: ErrorCode.UserAccountLocked
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type UpdateEmailErrorResponse =
    | UpdateEmailBadRequestResponse
    | OrgRestrictionErrorResponse
    | EmailAlreadySentResponse
    | DisabledResponse
    | IncorrectPasswordResponse
    | FailedToSendEmailResponse
    | UserAccountLockedResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse

/////////////////
///////////////// Visitor
/////////////////
export type UpdateEmailVisitor = LoggedInVisitor & {
    success: () => void
    badRequest?: (error: UpdateEmailBadRequestResponse) => void
    cannotChangeEmailDueToOrgMembership?: (error: OrgRestrictionErrorResponse) => void
    rateLimit?: (error: EmailAlreadySentResponse) => void
    incorrectPassword?: (error: IncorrectPasswordResponse) => void
    failedToSendEmail?: (error: FailedToSendEmailResponse) => void
    emailChangeDisabled?: (error: DisabledResponse) => void
    userAccountLocked?: (error: UserAccountLockedResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type UpdateEmailFn = ReturnType<typeof updateEmail>

export const updateEmail = (authUrl: string, excludeBasePath?: boolean) => async (request: UpdateEmailRequest) => {
    return makeRequest<UpdateEmailVisitor, UpdateEmailErrorResponse>({
        authUrl,
        excludeBasePath,
        path: '/update_email',
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
                case ErrorCode.Forbidden:
                    return getVisitorOrUndefined(visitor.cannotChangeEmailDueToOrgMembership, error)
                case ErrorCode.ConfirmationEmailAlreadySentRecently:
                    return getVisitorOrUndefined(visitor.rateLimit, error)
                case ErrorCode.ActionDisabled:
                    return getVisitorOrUndefined(visitor.emailChangeDisabled, error)
                case ErrorCode.IncorrectPassword:
                    return getVisitorOrUndefined(visitor.incorrectPassword, error)
                case ErrorCode.EmailSendFailure:
                    return getVisitorOrUndefined(visitor.failedToSendEmail, error)
                case ErrorCode.UserAccountLocked:
                    return getVisitorOrUndefined(visitor.userAccountLocked, error)
                case ErrorCode.Unauthorized:
                    return getVisitorOrUndefined(visitor.unauthorized, error)
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
