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
export type UpdateEmailRequest = {
    email: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface UpdateEmailBadRequestResponse<V extends ErrorVisitor> extends ErrorResponse<V> {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        email: string
    }
    field_errors: {
        email: string
    }
}

// TODO: probably want a more specific error code
export interface UpdateEmailCannotChangeResponse<V extends ErrorVisitor> extends GenericErrorResponse<V> {
    error_code: ErrorCode.Forbidden
    user_facing_error: string
}

export interface UpdateEmailRateLimitResponse<V extends ErrorVisitor> extends GenericErrorResponse<V> {
    error_code: ErrorCode.ConfirmationEmailAlreadySentRecently
    user_facing_error: string
}

// TODO: This should probably not be exposed to the customer
export interface UpdateEmailEmailSendFailureResponse<V extends ErrorVisitor> extends GenericErrorResponse<V> {
    error_code: ErrorCode.EmailSendFailure
    user_facing_error: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type UpdateEmailErrorResponse =
    | UpdateEmailBadRequestResponse<UpdateEmailErrorVisitor>
    | UpdateEmailCannotChangeResponse<UpdateEmailErrorVisitor>
    | UpdateEmailRateLimitResponse<UpdateEmailErrorVisitor>
    | UpdateEmailEmailSendFailureResponse<UpdateEmailErrorVisitor>
    | UnauthorizedResponse<UpdateEmailErrorVisitor>
    | UnexpectedErrorResponse<UpdateEmailErrorVisitor>
    | EmailNotConfirmedResponse<UpdateEmailErrorVisitor>

export type UpdateEmailSuccessResponse = {
    ok: true
}

/////////////////
///////////////// Error Visitor
/////////////////
export interface UpdateEmailErrorVisitor extends ErrorVisitor {
    badRequest: (error: UpdateEmailBadRequestResponse<UpdateEmailErrorVisitor>) => void
    cannotChangeEmail: (error: UpdateEmailCannotChangeResponse<UpdateEmailErrorVisitor>) => void
    rateLimit: (error: UpdateEmailRateLimitResponse<UpdateEmailErrorVisitor>) => void

    // These are generic error responses that can occur on any request
    unauthorized?: (error: UnauthorizedResponse<UpdateEmailErrorVisitor>) => void
    emailNotConfirmed?: (error: EmailNotConfirmedResponse<UpdateEmailErrorVisitor>) => void
    emailSendFailure?: (error: UpdateEmailEmailSendFailureResponse<UpdateEmailErrorVisitor>) => void
    unexpectedOrUnhandled?: () => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const updateEmail = (authUrl: string) => async (request: UpdateEmailRequest) => {
    return makeRequest<UpdateEmailSuccessResponse, UpdateEmailErrorResponse, UpdateEmailErrorVisitor>({
        authUrl,
        path: '/update_email',
        method: 'POST',
        body: request,
        errorToHandler: (error, visitor) => {
            switch (error.error_code) {
                case ErrorCode.InvalidRequestFields:
                    return getVisitorOrUndefined(visitor.badRequest, error)
                case ErrorCode.Forbidden:
                    return getVisitorOrUndefined(visitor.cannotChangeEmail, error)
                case ErrorCode.ConfirmationEmailAlreadySentRecently:
                    return getVisitorOrUndefined(visitor.rateLimit, error)
                case ErrorCode.EmailSendFailure:
                    return getVisitorOrUndefined(visitor.emailSendFailure, error)
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

async function testVisitorErrors() {
    const response = await updateEmail('https://auth.example.com')({ email: 'test@propelauth.com' })
    if (response.ok) {
        console.log('Success!')
        return
    }

    // One way to handle errors
    response.handleError({
        badRequest: (error) => {
            console.log('Bad Request')
            console.log(error.user_facing_errors)
            console.log(error.field_errors)
        },
        cannotChangeEmail: (error) => {
            console.log('Cannot change email')
            console.log(error.user_facing_error)
        },
        rateLimit: (error) => {
            console.log('Rate limit')
            console.log(error.user_facing_error)
        },
        unexpectedOrUnhandled: () => {
            console.log('Unexpected or unhandled error')
        },
    })

    // Another way to handle errors, with the caveat that you might not know
    // which error codes are appropriate
    switch (response.error_code) {
        case ErrorCode.InvalidRequestFields:
            console.log('Bad Request')
            console.log(response.user_facing_errors)
            console.log(response.field_errors)
            break
        case ErrorCode.Forbidden:
            console.log('Cannot change email')
            console.log(response.user_facing_error)
            break
        case ErrorCode.ConfirmationEmailAlreadySentRecently:
            console.log('Rate limit')
            console.log(response.user_facing_error)
            break
        default:
            console.log('Unexpected or unhandled error')
    }
}
