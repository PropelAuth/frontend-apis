import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    ForbiddenErrorResponse,
    OrgsNotEnabledErrorResponse,
    OrgNotFoundErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
    UserNotFoundErrorResponse,
    ApiErrorForSpecificFields,
} from '../helpers/errors'
import { LoggedInVisitor, makeRequest } from '../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type RemoveUserFromOrgRequest = {
    org_id: string
    user_id: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface MustBeAtLeastOneOwnerErrorResponse extends ApiErrorForSpecificFields {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        org_id: string
    }
    field_errors: {
        org_id: string
    }
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type RemoveUserFromOrgErrorResponse =
    | MustBeAtLeastOneOwnerErrorResponse
    | OrgsNotEnabledErrorResponse
    | OrgNotFoundErrorResponse
    | UserNotFoundErrorResponse
    | ForbiddenErrorResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | UnauthorizedResponse

/////////////////
///////////////// Visitor
/////////////////
export type RemoveUserFromOrgVisitor = LoggedInVisitor & {
    success: () => void
    mustBeAtLeastOneOwner?: (error: MustBeAtLeastOneOwnerErrorResponse) => void
    noRemovePermission?: (error: ForbiddenErrorResponse) => void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
    orgsNotEnabled?: (error: OrgsNotEnabledErrorResponse) => void
    userNotFoundInOrg?: (error: UserNotFoundErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type RemoveUserFromOrgFn = ReturnType<typeof removeUserFromOrg>

export const removeUserFromOrg =
    (authUrl: string, excludeBasePath?: boolean) => async (request: RemoveUserFromOrgRequest) => {
        return makeRequest<RemoveUserFromOrgVisitor, RemoveUserFromOrgErrorResponse>({
            authUrl,
            excludeBasePath,
            path: '/remove_user',
            method: 'POST',
            body: request,
            responseToSuccessHandler: (visitor) => {
                return () => visitor.success()
            },
            responseToErrorHandler: (error, visitor) => {
                const { error_code: errorCode } = error
                switch (errorCode) {
                    case ErrorCode.InvalidRequestFields:
                        return getVisitorOrUndefined(visitor.mustBeAtLeastOneOwner, error)
                    case ErrorCode.Forbidden:
                        return getVisitorOrUndefined(visitor.noRemovePermission, error)
                    case ErrorCode.OrgNotFound:
                        return getVisitorOrUndefined(visitor.orgNotFound, error)
                    case ErrorCode.UserNotFound:
                        return getVisitorOrUndefined(visitor.userNotFoundInOrg, error)
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
