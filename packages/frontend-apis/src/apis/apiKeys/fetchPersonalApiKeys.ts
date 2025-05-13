import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    ApiErrorForSpecificFields,
    ApiErrorResponse,
    EmailNotConfirmedResponse,
    ErrorCode,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../../helpers/errors'
import { LoggedInVisitor, makeRequest } from '../../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type FetchPersonalApiKeysRequest = {
    page_number?: number
    page_size?: number
    api_key_search?: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type PersonalApiKey = {
    api_key_id: string
    created_at: number
    expires_at_seconds: number | null
    metadata: Record<string, unknown> | null
}

export type FetchPersonalApiKeysSuccessResponse = {
    api_keys: PersonalApiKey[]
    total_api_keys: number
    current_page: number
    page_size: number
    has_more_results: boolean
}

export interface FetchPersonalApiKeysBadRequestResponse extends ApiErrorForSpecificFields {
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

export interface PersonalApiKeysDisabledErrorResponse extends ApiErrorResponse {
    error_code: ErrorCode.ActionDisabled
}

export type FetchPersonalApiKeysErrorResponse =
    | FetchPersonalApiKeysBadRequestResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | PersonalApiKeysDisabledErrorResponse

/////////////////
///////////////// Visitor
/////////////////
export type FetchPersonalApiKeysVisitor = LoggedInVisitor & {
    success: (data: FetchPersonalApiKeysSuccessResponse) => FetchPersonalApiKeysSuccessResponse | void
    badRequest?: (error: FetchPersonalApiKeysBadRequestResponse) => void
    personalApiKeysDisabled?: (error: PersonalApiKeysDisabledErrorResponse) => void
}

/////////////////
///////////////// Request
/////////////////
export type FetchPersonalApiKeysFn = ReturnType<typeof fetchPersonalApiKeys>

export const fetchPersonalApiKeys =
    (authUrl: string, excludeBasePath?: boolean) => async (request: FetchPersonalApiKeysRequest) => {
        const queryParams = new URLSearchParams()
        const { page_number, page_size, api_key_search } = request
        if (page_number) {
            queryParams.append('page_number', page_number.toString())
        }
        if (page_size) {
            queryParams.append('page_size', page_size.toString())
        }
        if (api_key_search) {
            queryParams.append('api_key_search', api_key_search)
        }

        return makeRequest<
            FetchPersonalApiKeysVisitor,
            FetchPersonalApiKeysErrorResponse,
            FetchPersonalApiKeysSuccessResponse
        >({
            authUrl,
            excludeBasePath,
            path: '/personal_api_keys',
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
                    case ErrorCode.ActionDisabled:
                        return getVisitorOrUndefined(visitor.personalApiKeysDisabled, error)
                    case ErrorCode.InvalidRequestFields:
                        return getVisitorOrUndefined(visitor.badRequest, error)
                    default:
                        unmatchedCase(errorCode)
                        return undefined
                }
            },
        })
    }
