import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import {
    ApiErrorForSpecificFields,
    EmailNotConfirmedResponse,
    ErrorCode,
    ForbiddenErrorResponse,
    GenericErrorResponse,
    OrgMaxUsersLimitExceededErrorResponse,
    OrgsNotEnabledErrorResponse,
    OrgNotFoundErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../helpers/errors'
import { LoggedInVisitor, makeRequest } from '../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type InviteUserToOrgRequest = {
    org_id: string
    email: string
    role: string
    additional_roles?: string[]
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface InviteUserToOrgFieldValidationErrorResponse extends ApiErrorForSpecificFields {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        email?: string
        role?: string
    }
    field_errors: {
        email?: string
        role?: string
    }
}

export interface UserAlreadyInOrgErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.ActionAlreadyComplete
    user_facing_error: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type InviteUserToOrgErrorResponse =
    | InviteUserToOrgFieldValidationErrorResponse
    | OrgsNotEnabledErrorResponse
    | OrgNotFoundErrorResponse
    | OrgMaxUsersLimitExceededErrorResponse
    | UserAlreadyInOrgErrorResponse
    | ForbiddenErrorResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | UnauthorizedResponse

/////////////////
///////////////// Visitor
/////////////////
export type InviteUserToOrgVisitor = LoggedInVisitor & {
    success: () => void
    badRequest?: (error: InviteUserToOrgFieldValidationErrorResponse) => void
    noInvitePermission?: (error: ForbiddenErrorResponse) => void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
    orgMaxUsersLimitExceeded?: (error: OrgMaxUsersLimitExceededErrorResponse) => void
    userAlreadyInOrg?: (error: UserAlreadyInOrgErrorResponse) => void
    orgsNotEnabled?: (error: OrgsNotEnabledErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type InviteUserToOrgFn = ReturnType<typeof inviteUserToOrg>

export const inviteUserToOrg = (authUrl: string) => async (request: InviteUserToOrgRequest) => {
    return makeRequest<InviteUserToOrgVisitor, InviteUserToOrgErrorResponse>({
        authUrl,
        path: '/invite_user',
        method: 'POST',
        body: {
            ...request,
            additional_roles: request.additional_roles ?? [],
        },
        responseToSuccessHandler: (visitor) => {
            return () => visitor.success()
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.InvalidRequestFields:
                    return getVisitorOrUndefined(visitor.badRequest, error)
                case ErrorCode.Forbidden:
                    return getVisitorOrUndefined(visitor.noInvitePermission, error)
                case ErrorCode.OrgNotFound:
                    return getVisitorOrUndefined(visitor.orgNotFound, error)
                case ErrorCode.OrgMaxUsersLimitExceeded:
                    return getVisitorOrUndefined(visitor.orgMaxUsersLimitExceeded, error)
                case ErrorCode.ActionAlreadyComplete:
                    return getVisitorOrUndefined(visitor.userAlreadyInOrg, error)
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
