import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    NotFoundErrorResponse,
    SessionManagementDisabledErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../../helpers/errors'
import { makeRequest, LoggedInVisitor } from '../../helpers/request'

/////////////////
///////////////// Error Responses
/////////////////
export type DeleteSessionErrorResponse =
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | NotFoundErrorResponse
    | SessionManagementDisabledErrorResponse

/////////////////
///////////////// Visitor
/////////////////
export type DeleteSessionVisitor = LoggedInVisitor & {
    success: () => void
    sessionNotFound?: (error: NotFoundErrorResponse) => void
    sessionManagementDisabled?: (error: SessionManagementDisabledErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type DeleteSessionFn = ReturnType<typeof deleteSession>

export const deleteSession = (authUrl: string) => async (sessionId: string) => {
    return makeRequest<DeleteSessionVisitor, DeleteSessionErrorResponse>({
        authUrl,
        path: `/sessions/${sessionId}`,
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
                case ErrorCode.NotFound:
                    return getVisitorOrUndefined(visitor.sessionNotFound, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
