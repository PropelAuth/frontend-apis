import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    SessionManagementDisabledErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../../helpers/errors'
import { makeRequest, LoggedInVisitor } from '../../helpers/request'

/////////////////
///////////////// Error Responses
/////////////////
export type DeleteAllButCurrentSessionErrorResponse =
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | SessionManagementDisabledErrorResponse

/////////////////
///////////////// Visitor
/////////////////
export type DeletAllButCurrentSessionVisitor = LoggedInVisitor & {
    success: () => void
    sessionManagementDisabled?: (error: SessionManagementDisabledErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type DeleteAllButCurrentSessionFn = ReturnType<typeof deleteAllButCurrentSession>

export const deleteAllButCurrentSession = (authUrl: string) => async () => {
    return makeRequest<DeletAllButCurrentSessionVisitor, DeleteAllButCurrentSessionErrorResponse>({
        authUrl,
        path: `/other_sessions`,
        method: 'DELETE',
        responseToSuccessHandler: (visitor) => {
            return () => visitor.success()
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.Unauthorized:
                    return getVisitorOrUndefined(visitor.unauthorized, error)
                case ErrorCode.EmailNotConfirmed:
                    return getVisitorOrUndefined(visitor.emailNotConfirmed, error)
                case ErrorCode.UnexpectedError:
                  return getVisitorOrUndefined(visitor.unexpectedOrUnhandled, error)
                case ErrorCode.ActionDisabled:
                    return getVisitorOrUndefined(visitor.sessionManagementDisabled, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
