import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    OrgsNotEnabledErrorResponse,
    OrgNotFoundErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../../helpers/errors'
import { Visitor, makeRequest } from '../../helpers/request'

/////////////////
///////////////// Request Params
/////////////////
export interface FetchPendingOrgInvitesRequestParams {
    page_size?: number
    page_number?: number
    email_search?: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export interface PendingOrgInvite {
    email: string
    role: string
    additional_roles: string[]
    expires_at_seconds: number
}

export type FetchPendingOrgInvitesSuccessResponse = {
    pending_invites: PendingOrgInvite[]
    total_count: number
    page_number: number
    page_size: number
    has_more_results: boolean
}

export type FetchOrgPendingOrgInvitesErrorResponse =
    | OrgsNotEnabledErrorResponse
    | OrgNotFoundErrorResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse

/////////////////
///////////////// Visitor
/////////////////
export type FetchPendingOrgInvitesVisitor = Visitor & {
    success: (data: FetchPendingOrgInvitesSuccessResponse) => FetchPendingOrgInvitesSuccessResponse | void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
    orgsNotEnabled?: (error: OrgsNotEnabledErrorResponse) => void
}

/////////////////
///////////////// Request
/////////////////
export type FetchPendingOrgInvitesFn = ReturnType<typeof fetchPendingOrgInvites>

export const fetchPendingOrgInvites =
    (authUrl: string) => async (orgId: string, params?: FetchPendingOrgInvitesRequestParams) => {
        const queryParams = new URLSearchParams()
        if (params?.page_size) {
            queryParams.append('page_size', params.page_size.toString())
        }
        if (params?.page_number) {
            queryParams.append('page_number', params.page_number.toString())
        }
        if (params?.email_search) {
            queryParams.append('email_search', params.email_search)
        }
        return makeRequest<
            FetchPendingOrgInvitesVisitor,
            FetchOrgPendingOrgInvitesErrorResponse,
            FetchPendingOrgInvitesSuccessResponse
        >({
            authUrl,
            path: `/org_membership/${orgId}/pending_invites`,
            method: 'GET',
            queryParams,
            parseResponseAsJson: true,
            responseToSuccessHandler: (response, visitor) => {
                return () => visitor.success(response)
            },
            responseToErrorHandler: (error, visitor) => {
                const { error_code: errorCode } = error
                switch (errorCode) {
                    case ErrorCode.OrgNotFound:
                        return getVisitorOrUndefined(visitor.orgNotFound, error)
                    case ErrorCode.ActionDisabled:
                        return getVisitorOrUndefined(visitor.orgsNotEnabled, error)
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
