import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import { ErrorCode, GenericErrorResponse, UnauthorizedResponse, UnexpectedErrorResponse } from '../helpers/errors'
import { makeRequest, Visitor } from '../helpers/request'

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
///////////////// Visitor
/////////////////
export type DeleteAccountVisitor = Visitor & {
    success: () => void
    unauthorized?: (error: UnauthorizedResponse) => void
    actionDisabled?: (error: DeleteAccountDisabledResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type DeleteAccountFn = ReturnType<typeof deleteAccount>

export const deleteAccount = (authUrl: string, excludeBasePath?: boolean) => async () => {
    return makeRequest<DeleteAccountVisitor, DeleteAccountErrorResponse>({
        authUrl,
        excludeBasePath,
        path: '/delete_me',
        method: 'DELETE',
        responseToSuccessHandler: (visitor) => {
            return () => visitor.success()
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.ActionDisabled:
                    return getVisitorOrUndefined(visitor.actionDisabled, error)
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
