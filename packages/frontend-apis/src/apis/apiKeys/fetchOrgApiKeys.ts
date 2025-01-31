import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    ApiErrorForSpecificFields,
    ApiErrorResponse,
    EmailNotConfirmedResponse,
    ErrorCode,
    ForbiddenErrorResponse,
    OrgNotFoundErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../../helpers/errors'
import { LoggedInVisitor, makeRequest } from '../../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type FetchOrgApiKeysRequest = {
    org_id: string
    page_number?: number
    page_size?: number
    api_key_search?: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type OrgApiKey = {
    api_key_id: string
    created_at: number
    expires_at_seconds: number | null
    metadata: Record<string, unknown> | null
}

export type FetchOrgApiKeysSuccessResponse = {
    api_keys: OrgApiKey[]
    total_api_keys: number
    current_page: number
    page_size: number
    has_more_results: boolean
}

export interface FetchOrgApiKeysBadRequestResponse extends ApiErrorForSpecificFields {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        page_size?: string
        page_number?: string
    }
    field_errors: {
        page_size?: string
        page_number?: string
    }
}

export interface OrgApiKeysDisabledErrorResponse extends ApiErrorResponse {
    error_code: ErrorCode.ActionDisabled
}

export type FetchOrgApiKeysErrorResponse =
    | FetchOrgApiKeysBadRequestResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | ForbiddenErrorResponse
    | OrgNotFoundErrorResponse
    | OrgApiKeysDisabledErrorResponse

/////////////////
///////////////// Visitor
/////////////////
export type FetchOrgApiKeysVisitor = LoggedInVisitor & {
    success: (data: FetchOrgApiKeysSuccessResponse) => FetchOrgApiKeysSuccessResponse | void
    badRequest?: (error: FetchOrgApiKeysBadRequestResponse) => void
    orgApiKeysDisabled?: (error: OrgApiKeysDisabledErrorResponse) => void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
    cannotAccessOrgApiKeys?: (error: ForbiddenErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type FetchOrgApiKeysFn = ReturnType<typeof fetchOrgApiKeys>

export const fetchOrgApiKeys = (authUrl: string) => async (request: FetchOrgApiKeysRequest) => {
    const queryParams = new URLSearchParams()
    const { page_number, page_size, api_key_search } = request
    queryParams.append('org_id', request.org_id)
    if (page_number) {
        queryParams.append('page_number', page_number.toString())
    }
    if (page_size) {
        queryParams.append('page_size', page_size.toString())
    }
    if (api_key_search) {
        queryParams.append('api_key_search', api_key_search)
    }

    return makeRequest<FetchOrgApiKeysVisitor, FetchOrgApiKeysErrorResponse, FetchOrgApiKeysSuccessResponse>({
        authUrl,
        path: '/org_api_keys',
        method: 'GET',
        parseResponseAsJson: true,
        queryParams,
        responseToSuccessHandler: (response, visitor) => {
            return () => visitor.success(response)
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
                case ErrorCode.Forbidden:
                    return getVisitorOrUndefined(visitor.cannotAccessOrgApiKeys, error)
                case ErrorCode.InvalidRequestFields:
                    return getVisitorOrUndefined(visitor.badRequest, error)
                case ErrorCode.OrgNotFound:
                    return getVisitorOrUndefined(visitor.orgNotFound, error)
                case ErrorCode.ActionDisabled:
                    return getVisitorOrUndefined(visitor.orgApiKeysDisabled, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
