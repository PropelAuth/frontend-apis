import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    ApiErrorResponse,
    GenericErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../helpers/errors'
import { Visitor, makeRequest } from '../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type UpdatePasswordRequest = {
    current_password?: string
    password: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface IncorrectPasswordResponse extends GenericErrorResponse {
    error_code: ErrorCode.IncorrectPassword
    user_facing_error: string
}

export interface UpdatePasswordBadRequestResponse extends ApiErrorResponse {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        password: string
    }
    field_errors: {
        password: string
    }
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type UpdatePasswordErrorResponse =
    | IncorrectPasswordResponse
    | UpdatePasswordBadRequestResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse

/////////////////
///////////////// Error Visitor
/////////////////
type UpdatePasswordVisitor = Visitor & {
    success: () => void
    incorrectPassword: (error: IncorrectPasswordResponse) => void
    badRequest: (error: UpdatePasswordBadRequestResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const updatePassword = (authUrl: string) => async (request: UpdatePasswordRequest) => {
    return makeRequest<UpdatePasswordVisitor, UpdatePasswordErrorResponse>({
        authUrl,
        path: '/update_password',
        method: 'POST',
        body: request,
        responseToSuccessHandler: (visitor) => {
            return async () => await visitor.success()
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.IncorrectPassword:
                    return getVisitorOrUndefined(visitor.incorrectPassword, error)
                case ErrorCode.InvalidRequestFields:
                    return getVisitorOrUndefined(visitor.badRequest, error)
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
