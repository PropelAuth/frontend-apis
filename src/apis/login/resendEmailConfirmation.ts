import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import { ErrorCode, GenericErrorResponse, UnauthorizedResponse, UnexpectedErrorResponse } from '../../helpers/errors'
import { Visitor, makeRequest } from '../../helpers/request'

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface EmailAlreadyConfirmedErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.EmailAlreadyConfirmed
}

export interface RateLimitedErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.RateLimited
}

/////////////////
///////////////// Error Responses
/////////////////
export type SendEmailConfirmationErrorResponse =
    | EmailAlreadyConfirmedErrorResponse
    | RateLimitedErrorResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse

/////////////////
///////////////// Visitor
/////////////////
type SendEmailConfirmationVisitor = Visitor & {
    success: () => void
    rateLimited?: (error: RateLimitedErrorResponse) => void
    emailAlreadyConfirmed?: (error: EmailAlreadyConfirmedErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const resendEmailConfirmation = (authUrl: string) => async () => {
    return makeRequest<SendEmailConfirmationVisitor, SendEmailConfirmationErrorResponse>({
        authUrl,
        path: '/resend_email_confirmation',
        method: 'POST',
        responseToSuccessHandler: (visitor) => {
            return () => visitor.success()
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.EmailAlreadyConfirmed:
                    return getVisitorOrUndefined(visitor.emailAlreadyConfirmed, error)
                case ErrorCode.RateLimited:
                    return getVisitorOrUndefined(visitor.rateLimited, error)
                case ErrorCode.Unauthorized:
                    return getVisitorOrUndefined(visitor.unauthorized, error)
                case ErrorCode.UnexpectedError:
                    return getVisitorOrUndefined(visitor.unexpectedOrUnhandled, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
