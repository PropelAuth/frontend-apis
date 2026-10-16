import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../../helpers/errors'
import { LoggedInVisitor, makeRequest } from '../../helpers/request'
import { GrantRequestNotFoundErrorResponse, McpNotEnabledErrorResponse } from './types'

/////////////////
///////////////// Request
/////////////////
export type FetchMcpConsentRequestRequest = {
    // The `t` query parameter from the consent page URL
    token: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type McpScope = {
    slug: string
    display_name: string
    description: string
    is_org_scope: boolean
}

export type McpOrgScopesOption = {
    org_id: string
    org_name: string
    // The org scopes the user's org has approved
    scopes: string[]
}

export type FetchMcpConsentRequestSuccessResponse = {
    client_id: string
    client_name: string | null
    scopes: McpScope[]
    redirect_uri: string
    resource: string
    scopeless_permission_message: string | null
    cimd_known_client: boolean
    cimd_known_client_name: string | null
    is_local_redirect: boolean
    // Only present if any of the requested scopes are org scopes
    org_and_scopes_options?: McpOrgScopesOption[]
}

export type FetchMcpConsentRequestErrorResponse =
    | UnauthorizedResponse
    | EmailNotConfirmedResponse
    | UnexpectedErrorResponse
    | McpNotEnabledErrorResponse
    | GrantRequestNotFoundErrorResponse

/////////////////
///////////////// Visitor
/////////////////
export type FetchMcpConsentRequestVisitor = LoggedInVisitor & {
    success: (data: FetchMcpConsentRequestSuccessResponse) => void
    mcpNotEnabled?: (error: McpNotEnabledErrorResponse) => void
    grantRequestNotFound?: (error: GrantRequestNotFoundErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type FetchMcpConsentRequestFn = ReturnType<typeof fetchMcpConsentRequest>

export const fetchMcpConsentRequest = (authUrl: string) => async (request: FetchMcpConsentRequestRequest) => {
    const queryParams = new URLSearchParams()
    queryParams.append('t', request.token)

    return makeRequest<
        FetchMcpConsentRequestVisitor,
        FetchMcpConsentRequestErrorResponse,
        FetchMcpConsentRequestSuccessResponse
    >({
        authUrl,
        path: '/consent',
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
                    return getVisitorOrUndefined(visitor.mcpNotEnabled, error)
                case ErrorCode.ResourceNotFound:
                    return getVisitorOrUndefined(visitor.grantRequestNotFound, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
