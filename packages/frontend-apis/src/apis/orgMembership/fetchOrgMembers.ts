import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    OrgsNotEnabledErrorResponse,
    OrgNotFoundErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../../helpers/errors'
import { LoggedInVisitor, makeRequest } from '../../helpers/request'

/////////////////
///////////////// Request Params
/////////////////
export interface FetchOrgMembersRequestParams {
    page_size?: number
    page_number?: number
    email_search?: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export interface OrgMember {
    user_id: string
    email: string
    role: string
    additional_roles: string[]
    possible_roles: string[]
    can_be_deleted: boolean
    is_enabled: boolean
    is_2fa_enabled?: boolean
}

export type FetchOrgMembersSuccessResponse = {
    users: OrgMember[]
    total_count: number
    page_number: number
    page_size: number
    has_more_results: boolean
}

export type FetchOrgMembersErrorResponse =
    | OrgsNotEnabledErrorResponse
    | OrgNotFoundErrorResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse

/////////////////
///////////////// Visitor
/////////////////
export type FetchOrgMembersVisitor = LoggedInVisitor & {
    success: (data: FetchOrgMembersSuccessResponse) => FetchOrgMembersSuccessResponse | void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
    orgsNotEnabled?: (error: OrgsNotEnabledErrorResponse) => void
}

/////////////////
///////////////// Request
/////////////////
export type FetchOrgMembersFn = ReturnType<typeof fetchOrgMembers>

export const fetchOrgMembers = (authUrl: string) => async (orgId: string, params?: FetchOrgMembersRequestParams) => {
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
    return makeRequest<FetchOrgMembersVisitor, FetchOrgMembersErrorResponse, FetchOrgMembersSuccessResponse>({
        authUrl,
        path: `/org_membership/${orgId}/members`,
        method: 'GET',
        parseResponseAsJson: true,
        queryParams,
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
