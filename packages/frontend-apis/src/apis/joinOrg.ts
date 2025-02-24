import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    OrgMaxUsersLimitExceededErrorResponse,
    OrgNotFoundErrorResponse,
    OrgsNotEnabledErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
    UserMaxOrgsLimitExceededErrorResponse,
} from '../helpers/errors'
import { LoggedInVisitor, makeRequest } from '../helpers/request'

/////////////////
///////////////// Success and Error Responses
/////////////////
export type JoinOrgSuccessResponse = {
    org_id: string
    first_org: boolean
}

export type JoinOrgErrorResponse =
    | OrgsNotEnabledErrorResponse
    | UserMaxOrgsLimitExceededErrorResponse
    | UnauthorizedResponse
    | EmailNotConfirmedResponse
    | UnexpectedErrorResponse
    | OrgMaxUsersLimitExceededErrorResponse
    | OrgNotFoundErrorResponse

/////////////////
///////////////// Error Visitor
/////////////////
export type JoinOrgVisitor = LoggedInVisitor & {
    success: (data: JoinOrgSuccessResponse) => void
    userAlreadyInTooManyOrgs?: (error: UserMaxOrgsLimitExceededErrorResponse) => void
    orgMaxUsersLimitExceeded?: (error: OrgMaxUsersLimitExceededErrorResponse) => void
    orgsNotEnabled?: (error: OrgsNotEnabledErrorResponse) => void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type JoinOrgFn = ReturnType<typeof joinOrg>

export const joinOrg = (authUrl: string) => async (orgId: string) => {
    return makeRequest<JoinOrgVisitor, JoinOrgErrorResponse, JoinOrgSuccessResponse>({
        authUrl,
        path: `/join_org/${orgId}`,
        parseResponseAsJson: true,
        method: 'POST',
        responseToSuccessHandler: (response, visitor) => {
            return () => visitor.success(response)
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.OrgMaxUsersLimitExceeded:
                    return getVisitorOrUndefined(visitor.orgMaxUsersLimitExceeded, error)
                case ErrorCode.UserMaxOrgsLimitExceeded:
                    return getVisitorOrUndefined(visitor.userAlreadyInTooManyOrgs, error)
                case ErrorCode.Unauthorized:
                    return getVisitorOrUndefined(visitor.unauthorized, error)
                case ErrorCode.UnexpectedError:
                    return getVisitorOrUndefined(visitor.unexpectedOrUnhandled, error)
                case ErrorCode.EmailNotConfirmed:
                    return getVisitorOrUndefined(visitor.emailNotConfirmed, error)
                case ErrorCode.ActionDisabled:
                    return getVisitorOrUndefined(visitor.orgsNotEnabled, error)
                case ErrorCode.OrgNotFound:
                    return getVisitorOrUndefined(visitor.orgNotFound, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
