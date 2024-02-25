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
export type UpdatePasswordRequest = {
    current_password?: string
    password: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface UpdatePasswordBadRequestResponse<V extends Visitor> extends ErrorResponse<V> {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        password?: string
    }
    field_errors: {
        password?: string
    }
}

export interface UpdatePasswordIncorrectPasswordResponse<V extends Visitor> extends GenericErrorResponse<V> {
    error_code: ErrorCode.IncorrectPassword
    user_facing_error: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type UpdatePasswordErrorResponse =
    | UpdatePasswordBadRequestResponse<UpdatePasswordVisitor>
    | UpdatePasswordIncorrectPasswordResponse<UpdatePasswordVisitor>
    | UnauthorizedResponse<UpdatePasswordVisitor>
    | UnexpectedErrorResponse<UpdatePasswordVisitor>
    | EmailNotConfirmedResponse<UpdatePasswordVisitor>

export type UpdatePasswordSuccessResponse = SuccessfulResponse<UpdatePasswordVisitor>

/////////////////
///////////////// Error Visitor
/////////////////
export interface UpdatePasswordVisitor extends Visitor {
    badRequest: (error: UpdatePasswordBadRequestResponse<UpdatePasswordVisitor>) => Promise<void> | void
    incorrectPassword: (error: UpdatePasswordIncorrectPasswordResponse<UpdatePasswordVisitor>) => Promise<void> | void

    // These are generic error responses that can occur on any request
    unauthorized?: (error: UnauthorizedResponse<UpdatePasswordVisitor>) => Promise<void> | void
    emailNotConfirmed?: (error: EmailNotConfirmedResponse<UpdatePasswordVisitor>) => Promise<void> | void
}

/////////////////
///////////////// The actual Request
/////////////////
export const updatePassword = (authUrl: string) => async (request: UpdatePasswordRequest) => {
    return makeRequest<UpdatePasswordSuccessResponse, UpdatePasswordErrorResponse, UpdatePasswordVisitor>({
        authUrl,
        path: '/update_password',
        method: 'POST',
        body: request,
        responseToHandler: (response, visitor) => {
            if (response.ok) {
                return visitor.success
            } else {
                switch (response.error_code) {
                    case ErrorCode.InvalidRequestFields:
                        return getVisitorOrUndefined(visitor.badRequest, response)
                    case ErrorCode.IncorrectPassword:
                        return getVisitorOrUndefined(visitor.incorrectPassword, response)
                    case ErrorCode.Unauthorized:
                        return getVisitorOrUndefined(visitor.unauthorized, response)
                    case ErrorCode.UnexpectedError:
                        return visitor.unexpectedOrUnhandled
                }
            }
        },
    })
}
