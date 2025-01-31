import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import {
    ApiErrorForSpecificFields,
    EmailNotConfirmedResponse,
    ErrorCode,
    IncorrectPasswordResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../helpers/errors'
import { LoggedInVisitor, makeRequest } from '../helpers/request'
import { UserAccountLockedResponse } from './updateEmail'

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
export interface UpdatePasswordBadRequestResponse extends ApiErrorForSpecificFields {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        password?: string
        current_password?: string
    }
    field_errors: {
        password?: string
        current_password?: string
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
    | UserAccountLockedResponse

/////////////////
///////////////// Visitor
/////////////////
export type UpdatePasswordVisitor = LoggedInVisitor & {
    success: () => void
    incorrectPassword?: (error: IncorrectPasswordResponse) => void
    badRequest?: (error: UpdatePasswordBadRequestResponse) => void
    userAccountLocked?: (error: UserAccountLockedResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type UpdatePasswordFn = ReturnType<typeof updatePassword>

export const updatePassword = (authUrl: string) => async (request: UpdatePasswordRequest) => {
    return makeRequest<UpdatePasswordVisitor, UpdatePasswordErrorResponse>({
        authUrl,
        path: '/update_password',
        method: 'POST',
        body: request,
        responseToSuccessHandler: (visitor) => {
            return () => visitor.success()
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
                case ErrorCode.UserAccountLocked:
                    return getVisitorOrUndefined(visitor.userAccountLocked, error)
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
