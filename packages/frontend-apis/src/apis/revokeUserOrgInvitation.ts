import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import {
    ApiErrorForSpecificFields,
    EmailNotConfirmedResponse,
    ErrorCode,
    ForbiddenErrorResponse,
    OrgsNotEnabledErrorResponse,
    OrgNotFoundErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../helpers/errors'
import { LoggedInVisitor, makeRequest } from '../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type RevokeUserOrgInvitationRequest = {
    org_id: string
    email: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface RevokeUserOrgInvitationFieldValidationErrorResponse extends ApiErrorForSpecificFields {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        role?: string
    }
    field_errors: {
        role?: string
    }
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type RevokeUserOrgInvitationErrorResponse =
    | RevokeUserOrgInvitationFieldValidationErrorResponse
    | OrgsNotEnabledErrorResponse
    | OrgNotFoundErrorResponse
    | ForbiddenErrorResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | UnauthorizedResponse

/////////////////
///////////////// Visitor
/////////////////
export type RevokeUserOrgInvitationVisitor = LoggedInVisitor & {
    success: () => void
    badRequest?: (error: RevokeUserOrgInvitationFieldValidationErrorResponse) => void
    noRevokeInvitePermission?: (error: ForbiddenErrorResponse) => void
    orgsNotEnabled?: (error: OrgsNotEnabledErrorResponse) => void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
}
/////////////////
///////////////// The actual Request
/////////////////
export type RevokeUserOrgInvitationFn = ReturnType<typeof revokeUserOrgInvitation>

export const revokeUserOrgInvitation =
    (authUrl: string, excludeBasePath?: boolean) => async (request: RevokeUserOrgInvitationRequest) => {
        return makeRequest<RevokeUserOrgInvitationVisitor, RevokeUserOrgInvitationErrorResponse>({
            authUrl,
            excludeBasePath,
            path: '/revoke_user_invitation',
            method: 'POST',
            body: request,
            responseToSuccessHandler: (visitor) => {
                return () => visitor.success()
            },
            responseToErrorHandler: (error, visitor) => {
                const { error_code: errorCode } = error
                switch (errorCode) {
                    case ErrorCode.InvalidRequestFields:
                        return getVisitorOrUndefined(visitor.badRequest, error)
                    case ErrorCode.Forbidden:
                        return getVisitorOrUndefined(visitor.noRevokeInvitePermission, error)
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
