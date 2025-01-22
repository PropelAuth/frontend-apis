import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import { ApiErrorForSpecificFields, ErrorCode, UnexpectedErrorResponse } from '../../helpers/errors'
import { makeRequest, Visitor } from '../../helpers/request'

export type ForgotPasswordRequest = {
    email: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface ForgotPasswordBadRequestResponse extends ApiErrorForSpecificFields {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        email: string
    }
    field_errors: {
        email: string
    }
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type ForgotPasswordSuccessResponse = {
    message: string
    sniper_links: {
        gmail: string
        outlook: string
        yahoo: string
    }
}

export type ForgotPasswordErrorResponse = ForgotPasswordBadRequestResponse | UnexpectedErrorResponse

/////////////////
///////////////// Visitor
/////////////////
export type ForgotPasswordVisitor = Visitor & {
    success: (data: ForgotPasswordSuccessResponse) => void
    badRequest?: (error: ForgotPasswordBadRequestResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type SendForgotPasswordEmailFn = ReturnType<typeof sendForgotPasswordEmail>

export const sendForgotPasswordEmail = (authUrl: string) => async (request: ForgotPasswordRequest) => {
    return makeRequest<ForgotPasswordVisitor, ForgotPasswordErrorResponse, ForgotPasswordSuccessResponse>({
        authUrl,
        path: '/forgot_password',
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
                case ErrorCode.UnexpectedError:
                    return getVisitorOrUndefined(visitor.unexpectedOrUnhandled, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
