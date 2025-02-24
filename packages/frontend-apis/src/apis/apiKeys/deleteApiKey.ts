import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    ForbiddenErrorResponse,
    NotFoundErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../../helpers/errors'
import { makeRequest, LoggedInVisitor } from '../../helpers/request'

/////////////////
///////////////// Error Responses
/////////////////
export type DeleteApiKeyErrorResponse =
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | ForbiddenErrorResponse
    | NotFoundErrorResponse

/////////////////
///////////////// Visitor
/////////////////
export type DeleteApiKeyVisitor = LoggedInVisitor & {
    success: () => void
    noApiKeyPermission?: (error: ForbiddenErrorResponse) => void
    apiKeyNotFound?: (error: NotFoundErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type DeleteApiKeyFn = ReturnType<typeof deleteApiKey>

export const deleteApiKey = (authUrl: string) => async (apiKeyId: string) => {
    return makeRequest<DeleteApiKeyVisitor, DeleteApiKeyErrorResponse>({
        authUrl,
        path: `/api_keys/${apiKeyId}`,
        method: 'DELETE',
        responseToSuccessHandler: (visitor) => {
            return () => visitor.success()
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.Forbidden:
                    return getVisitorOrUndefined(visitor.noApiKeyPermission, error)
                case ErrorCode.Unauthorized:
                    return getVisitorOrUndefined(visitor.unauthorized, error)
                case ErrorCode.EmailNotConfirmed:
                    return getVisitorOrUndefined(visitor.emailNotConfirmed, error)
                case ErrorCode.UnexpectedError:
                    return getVisitorOrUndefined(visitor.unexpectedOrUnhandled, error)
                case ErrorCode.NotFound:
                    return getVisitorOrUndefined(visitor.apiKeyNotFound, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
