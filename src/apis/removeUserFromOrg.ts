import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import {
    ApiErrorResponse,
    EmailNotConfirmedResponse,
    ErrorCode,
    ForbiddenErrorResponse,
    OrgNotEnabledErrorResponse,
    OrgNotFoundErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
    UserNotFoundErrorResponse,
} from '../helpers/errors'
import { Visitor, makeRequest } from '../helpers/request'

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
export interface RemoveUserFromOrgBadRequestResponse extends ApiErrorResponse {
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
    | RemoveUserFromOrgBadRequestResponse
    | OrgNotEnabledErrorResponse
    | OrgNotFoundErrorResponse
    | UserNotFoundErrorResponse
    | ForbiddenErrorResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | UnauthorizedResponse

/////////////////
///////////////// Visitor
/////////////////
type RemoveUserFromOrgVisitor = Visitor & {
    success: () => void
    badRequest?: (error: RemoveUserFromOrgBadRequestResponse) => void
    noRemovePermission?: (error: ForbiddenErrorResponse) => void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
    orgsNotEnabled?: (error: OrgNotEnabledErrorResponse) => void
    userNotFoundInOrg?: (error: UserNotFoundErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const removeUserFromOrg = (authUrl: string) => async (request: RemoveUserFromOrgRequest) => {
    return makeRequest<RemoveUserFromOrgVisitor, RemoveUserFromOrgErrorResponse>({
        authUrl,
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
                    return getVisitorOrUndefined(visitor.badRequest, error)
                case ErrorCode.Forbidden:
                    return getVisitorOrUndefined(visitor.noRemovePermission, error)
                case ErrorCode.OrgNotFound:
                    return getVisitorOrUndefined(visitor.orgNotFound, error)
                case ErrorCode.UserNotFound:
                    return getVisitorOrUndefined(visitor.userNotFound, error)
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
