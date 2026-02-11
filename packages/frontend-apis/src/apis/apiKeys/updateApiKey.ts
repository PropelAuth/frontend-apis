import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    ForbiddenErrorResponse,
    NotFoundErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
    ApiErrorForSpecificFields,
} from '../../helpers/errors'
import { makeRequest, LoggedInVisitor } from '../../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type UpdateApiKeyRequest = {
    api_key_id: string
    display_name: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface UpdateApiKeyBadRequestResponse extends ApiErrorForSpecificFields {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        name: string
    }
    field_errors: {
        name: string
    }
}

/////////////////
///////////////// Error Responses
/////////////////
export type UpdateApiKeyErrorResponse =
    | UpdateApiKeyBadRequestResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | ForbiddenErrorResponse
    | NotFoundErrorResponse

/////////////////
///////////////// Visitor
/////////////////
export type UpdateApiKeyVisitor = LoggedInVisitor & {
    success: () => void
    badRequest?: (error: UpdateApiKeyBadRequestResponse) => void
    noApiKeyPermission?: (error: ForbiddenErrorResponse) => void
    apiKeyNotFound?: (error: NotFoundErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type UpdateApiKeyFn = ReturnType<typeof updateApiKey>

export const updateApiKey = (authUrl: string) => async (request: UpdateApiKeyRequest) => {
    return makeRequest<UpdateApiKeyVisitor, UpdateApiKeyErrorResponse>({
        authUrl,
        path: `/api_keys/${request.api_key_id}`,
        method: 'PATCH',
        body: {
            display_name: request.display_name,
        },
        responseToSuccessHandler: (visitor) => {
            return () => visitor.success()
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.InvalidRequestFields:
                    return getVisitorOrUndefined(visitor.badRequest, error)
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
