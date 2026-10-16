import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    ApiErrorResponse,
    BadRequestErrorResponse,
    EmailNotConfirmedResponse,
    ErrorCode,
    ForbiddenErrorResponse,
    OrgNotFoundErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../../helpers/errors'
import { LoggedInVisitor, makeRequest } from '../../helpers/request'
import { GrantRequestNotFoundErrorResponse, McpNotEnabledErrorResponse } from './types'

/////////////////
///////////////// Request
/////////////////
export type SubmitMcpConsentRequest = {
    // The `t` query parameter from the consent page URL
    token: string
    // true to grant consent, false to deny it
    consent: boolean
    // Required if any of the requested scopes are org scopes
    org_id?: string
    // A subset of the requested scopes to grant. If omitted, all requested scopes are granted
    downselected_scopes?: string[]
    custom_consent_data?: Record<string, unknown>
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface TooManyGrantsErrorResponse extends ApiErrorResponse {
    error_code: ErrorCode.TooManyGrants
}

export interface ScopesRequiredErrorResponse extends ApiErrorResponse {
    error_code: ErrorCode.ScopesRequired
}

// Returned when the user must log in again through their org's identity provider before granting org scopes.
// `redirect_to` is a path on your auth URL (e.g. `/login_sso`) that will log the user in and return them to
// the consent page with the org preselected.
export interface SsoLoginRequiredErrorResponse extends ApiErrorResponse {
    error_code: ErrorCode.SsoLoginRequired
    redirect_to: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type SubmitMcpConsentSuccessResponse = {
    // The URL to redirect the user to, which completes the authorization flow for the MCP client
    redirect_to: string
}

export type SubmitMcpConsentErrorResponse =
    | UnauthorizedResponse
    | EmailNotConfirmedResponse
    | UnexpectedErrorResponse
    | McpNotEnabledErrorResponse
    | GrantRequestNotFoundErrorResponse
    | TooManyGrantsErrorResponse
    | ScopesRequiredErrorResponse
    | OrgNotFoundErrorResponse
    | BadRequestErrorResponse
    | ForbiddenErrorResponse
    | SsoLoginRequiredErrorResponse

/////////////////
///////////////// Visitor
/////////////////
export type SubmitMcpConsentVisitor = LoggedInVisitor & {
    success: (data: SubmitMcpConsentSuccessResponse) => void
    mcpNotEnabled?: (error: McpNotEnabledErrorResponse) => void
    grantRequestNotFound?: (error: GrantRequestNotFoundErrorResponse) => void
    userHasMaximumGrants?: (error: TooManyGrantsErrorResponse) => void
    noScopesInOrgGrant?: (error: ScopesRequiredErrorResponse) => void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
    orgRequiredForOrgScopes?: (error: BadRequestErrorResponse) => void
    insufficientPermissions?: (error: ForbiddenErrorResponse) => void
    ssoLoginRequired?: (error: SsoLoginRequiredErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type SubmitMcpConsentFn = ReturnType<typeof submitMcpConsent>

export const submitMcpConsent = (authUrl: string) => async (request: SubmitMcpConsentRequest) => {
    const { token, ...rest } = request
    return makeRequest<SubmitMcpConsentVisitor, SubmitMcpConsentErrorResponse, SubmitMcpConsentSuccessResponse>({
        authUrl,
        path: '/consent',
        method: 'POST',
        parseResponseAsJson: true,
        body: { t: token, ...rest },
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
                case ErrorCode.TooManyGrants:
                    return getVisitorOrUndefined(visitor.userHasMaximumGrants, error)
                case ErrorCode.ScopesRequired:
                    return getVisitorOrUndefined(visitor.noScopesInOrgGrant, error)
                case ErrorCode.OrgNotFound:
                    return getVisitorOrUndefined(visitor.orgNotFound, error)
                case ErrorCode.BadRequest:
                    return getVisitorOrUndefined(visitor.orgRequiredForOrgScopes, error)
                case ErrorCode.Forbidden:
                    return getVisitorOrUndefined(visitor.insufficientPermissions, error)
                case ErrorCode.SsoLoginRequired:
                    return getVisitorOrUndefined(visitor.ssoLoginRequired, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
