import { getVisitorOrUndefined } from '../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    ErrorResponse,
    GenericErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../helpers/errors'
import { Visitor, SuccessfulResponse, makeRequest } from '../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type UpdateEmailRequest = {
    email: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface UpdateEmailBadRequestResponse<V extends Visitor> extends ErrorResponse<V> {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        email: string
    }
    field_errors: {
        email: string
    }
}

export interface UpdateEmailCannotChangeResponse<V extends Visitor> extends GenericErrorResponse<V> {
    error_code: ErrorCode.Forbidden
    user_facing_error: string
}

export interface UpdateEmailRateLimitResponse<V extends Visitor> extends GenericErrorResponse<V> {
    error_code: ErrorCode.ConfirmationEmailAlreadySentRecently
    user_facing_error: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type UpdateEmailErrorResponse =
    | UpdateEmailBadRequestResponse<UpdateEmailVisitor>
    | UpdateEmailCannotChangeResponse<UpdateEmailVisitor>
    | UpdateEmailRateLimitResponse<UpdateEmailVisitor>
    | UnauthorizedResponse<UpdateEmailVisitor>
    | UnexpectedErrorResponse<UpdateEmailVisitor>
    | EmailNotConfirmedResponse<UpdateEmailVisitor>

export type UpdateEmailSuccessResponse = SuccessfulResponse<UpdateEmailVisitor>

/////////////////
///////////////// Error Visitor
/////////////////
export interface UpdateEmailVisitor extends Visitor {
    success?: () => void
    badRequest: (error: UpdateEmailBadRequestResponse<UpdateEmailVisitor>) => void
    cannotChangeEmail: (error: UpdateEmailCannotChangeResponse<UpdateEmailVisitor>) => void
    rateLimit: (error: UpdateEmailRateLimitResponse<UpdateEmailVisitor>) => void

    // These are generic error responses that can occur on any request
    unauthorized?: (error: UnauthorizedResponse<UpdateEmailVisitor>) => void
    emailNotConfirmed?: (error: EmailNotConfirmedResponse<UpdateEmailVisitor>) => void
    unexpectedOrUnhandled?: () => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const updateEmail = (authUrl: string) => async (request: UpdateEmailRequest) => {
    return makeRequest<UpdateEmailSuccessResponse, UpdateEmailErrorResponse, UpdateEmailVisitor>({
        authUrl,
        path: '/update_email',
        method: 'POST',
        body: request,
        responseToHandler: (response, visitor) => {
            if (response.ok) {
            } else {
                switch (response.error_code) {
                    case ErrorCode.InvalidRequestFields:
                        return getVisitorOrUndefined(visitor.badRequest, response)
                    case ErrorCode.Forbidden:
                        return getVisitorOrUndefined(visitor.cannotChangeEmail, response)
                    case ErrorCode.ConfirmationEmailAlreadySentRecently:
                        return getVisitorOrUndefined(visitor.rateLimit, response)
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function testVisitorErrors() {
    const response = await updateEmail('https://auth.example.com')({ email: 'test@propelauth.com' })

    // One way to handle errors
    response.handle({
        success: () => {
            console.log('Success!')
        },
        badRequest: (response) => {
            console.log('Bad Request')
            console.log(response.user_facing_errors)
            console.log(response.field_errors)
        },
        cannotChangeEmail: (response) => {
            console.log('Cannot change email')
            console.log(response.user_facing_error)
        },
        rateLimit: (response) => {
            console.log('Rate limit')
            console.log(response.user_facing_error)
        },
        unexpectedOrUnhandled: () => {
            console.log('Unexpected or unhandled error')
        },
    })

    // Another way to handle errors, with the caveat that you might not know
    // which error codes are appropriate
    if (response.ok) {
        console.log('Success!')
        return
    }

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
