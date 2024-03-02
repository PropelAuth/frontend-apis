import { getVisitorOrUndefined } from '../helpers/error_utils'
import { ErrorCode, GenericErrorResponse, UnauthorizedResponse, UnexpectedErrorResponse } from '../helpers/errors'
import { SuccessfulResponse, ErrorResponse, Visitor, makeRequest } from '../helpers/request'

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface DeleteAccountDisabledResponse extends GenericErrorResponse {
    error_code: ErrorCode.ActionDisabled
    user_facing_error: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type DeleteAccountErrorResponse = DeleteAccountDisabledResponse | UnauthorizedResponse | UnexpectedErrorResponse

/////////////////
///////////////// Error Visitor
/////////////////
export interface DeleteAccountVisitor extends Visitor {
    success: () => Promise<void> | void
    actionDisabled: (error: DeleteAccountDisabledResponse) => Promise<void> | void

    // These are generic error responses that can occur on any request
    unauthorized?: (error: UnauthorizedResponse) => Promise<void> | void
}

/////////////////
///////////////// The actual Request
/////////////////
export const deleteAccount = (authUrl: string) => async () => {
    return makeRequest<
        SuccessfulResponse<DeleteAccountVisitor>,
        DeleteAccountErrorResponse,
        ErrorResponse<DeleteAccountVisitor, DeleteAccountErrorResponse>,
        DeleteAccountVisitor
    >({
        authUrl,
        path: '/delete_me',
        method: 'DELETE',
        responseToSuccessHandler: (visitor) => {
            return async () => await visitor.success()
        },
        responseToErrorHandler: (error, visitor) => {
            switch (error.error_code) {
                case ErrorCode.ActionDisabled:
                    return getVisitorOrUndefined(visitor.actionDisabled, error)
                case ErrorCode.Unauthorized:
                    return getVisitorOrUndefined(visitor.unauthorized, error)
                case ErrorCode.UnexpectedError:
                    return visitor.unexpectedOrUnhandled
            }
        },
    })
}
