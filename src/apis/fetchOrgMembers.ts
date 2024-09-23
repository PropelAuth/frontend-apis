import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    OrgNotEnabledErrorResponse,
    OrgNotFoundErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../helpers/errors'
import { Visitor, makeRequest } from '../helpers/request'

/////////////////
///////////////// Success and Error Responses
/////////////////
export interface PendingOrgInvite {
    email: string
    role: string
    additional_roles: string[]
    expires_at_seconds: number
}

export interface OrgMember {
    user_id: string
    email: string
    role: string
    additional_roles: string[]
    possible_roles: string[]
    can_be_deleted: boolean
    is_enabled: boolean
    is_2fa_enabled?: boolean | null
}

export type FetchOrgMembersSuccessResponse = {
    users: OrgMember[]
    invitee_possible_roles: string[]
    pending_invites: PendingOrgInvite[]
    expired_invites: PendingOrgInvite[]
}

export type FetchOrgMembersErrorResponse =
    | OrgNotEnabledErrorResponse
    | OrgNotFoundErrorResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse

/////////////////
///////////////// Visitor
/////////////////
type FetchOrgMembersVisitor = Visitor & {
    success: (data: FetchOrgMembersSuccessResponse) => FetchOrgMembersSuccessResponse | void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
    orgNotEnabled?: (error: OrgNotEnabledErrorResponse) => void
}

/////////////////
///////////////// Request
/////////////////
export const fetchOrgMembers = (authUrl: string) => async (orgId: string) => {
    return makeRequest<FetchOrgMembersVisitor, FetchOrgMembersErrorResponse, FetchOrgMembersSuccessResponse>({
        authUrl,
        path: `/selected_org_status/${orgId}`,
        method: 'GET',
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
                    return getVisitorOrUndefined(visitor.orgNotEnabled, error)
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
