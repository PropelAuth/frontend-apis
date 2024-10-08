import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    ForbiddenErrorResponse,
    GenericErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../../helpers/errors'
import { makeRequest, Visitor } from '../../helpers/request'
import { ApiKeyExpirationOption } from './types'

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface InvalidExpirationOptionResponse extends GenericErrorResponse {
    error_code: ErrorCode.BadRequest
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type CreatePersonalApiKeySuccessResponse = {
    api_key_id: string
    api_key_token: string
}

export type CreatePersonalApiKeyErrorResponse =
    | InvalidExpirationOptionResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | ForbiddenErrorResponse

/////////////////
///////////////// Visitor
/////////////////
type CreatePersonalApiKeyVisitor = Visitor & {
    success: (data: CreatePersonalApiKeySuccessResponse) => void
    invalidExpirationOption?: (error: InvalidExpirationOptionResponse) => void
    noPersonalApiKeyPermission?: (error: ForbiddenErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const createPersonalApiKey = (authUrl: string) => async (expirationOption?: ApiKeyExpirationOption) => {
    return makeRequest<
        CreatePersonalApiKeyVisitor,
        CreatePersonalApiKeyErrorResponse,
        CreatePersonalApiKeySuccessResponse
    >({
        authUrl,
        path: '/api_keys',
        method: 'POST',
        parseResponseAsJson: true,
        body: {
            expiration_option: expirationOption,
        },
        responseToSuccessHandler: (response, visitor) => {
            return () => visitor.success(response)
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.Forbidden:
                    return getVisitorOrUndefined(visitor.noPersonalApiKeyPermission, error)
                case ErrorCode.BadRequest:
                    return getVisitorOrUndefined(visitor.invalidExpirationOption, error)
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
