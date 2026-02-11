import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    ForbiddenErrorResponse,
    InvalidExpirationOptionResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
    ApiErrorForSpecificFields,
} from '../../helpers/errors'
import { makeRequest, LoggedInVisitor } from '../../helpers/request'
import { ApiKeyExpirationOption } from './types'

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface CreateOrgApiKeyBadRequestResponse extends ApiErrorForSpecificFields {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        name: string
    }
    field_errors: {
        name: string
    }
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type CreateOrgApiKeySuccessResponse = {
    api_key_id: string
    api_key_token: string
}

export type CreateOrgApiKeyErrorResponse =
    | CreateOrgApiKeyBadRequestResponse
    | InvalidExpirationOptionResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | ForbiddenErrorResponse

/////////////////
///////////////// Visitor
/////////////////
export type CreateOrgApiKeyVisitor = LoggedInVisitor & {
    success: (data: CreateOrgApiKeySuccessResponse) => void
    badRequest?: (error: CreateOrgApiKeyBadRequestResponse) => void
    invalidExpirationOption?: (error: InvalidExpirationOptionResponse) => void
    noOrgApiKeyPermission?: (error: ForbiddenErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type CreateOrgApiKeyFn = ReturnType<typeof createOrgApiKey>

export const createOrgApiKey =
    (authUrl: string) => async (orgId: string, expirationOption?: ApiKeyExpirationOption, displayName?: string) => {
        return makeRequest<CreateOrgApiKeyVisitor, CreateOrgApiKeyErrorResponse, CreateOrgApiKeySuccessResponse>({
            authUrl,
            path: '/api_keys',
            method: 'POST',
            parseResponseAsJson: true,
            body: {
                org_id: orgId,
                expiration_option: expirationOption,
                display_name: displayName,
            },
            responseToSuccessHandler: (response, visitor) => {
                return () => visitor.success(response)
            },
            responseToErrorHandler: (error, visitor) => {
                const { error_code: errorCode } = error
                switch (errorCode) {
                    case ErrorCode.InvalidRequestFields:
                        return getVisitorOrUndefined(visitor.badRequest, error)
                    case ErrorCode.Forbidden:
                        return getVisitorOrUndefined(visitor.noOrgApiKeyPermission, error)
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
