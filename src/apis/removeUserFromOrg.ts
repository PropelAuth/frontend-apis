import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import {
    ApiErrorResponse,
    EmailNotConfirmedResponse,
    ErrorCode,
    GenericErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
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

export interface OrgNotEnabledErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.ActionDisabled
    user_facing_error: string
}

export interface OrgNotFoundErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.OrgNotFound
    user_facing_error: string
}

export interface UserNotFoundErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.UserNotFound
    user_facing_error: string
}

export interface ForbiddenResponse extends GenericErrorResponse {
    error_code: ErrorCode.Forbidden
    user_facing_error: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type RemoveUserFromOrgErrorResponse =
    | RemoveUserFromOrgBadRequestResponse
    | OrgNotEnabledErrorResponse
    | OrgNotFoundErrorResponse
    | UserNotFoundErrorResponse
    | ForbiddenResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | UnauthorizedResponse

/////////////////
///////////////// Visitor
/////////////////
type RemoveUserFromOrgVisitor = Visitor & {
    success: () => void
    badRequest?: (error: RemoveUserFromOrgBadRequestResponse) => void
    noRemovePermission?: (error: ForbiddenResponse) => void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
    orgNotEnabled?: (error: OrgNotEnabledErrorResponse) => void
    userNotFound?: (error: UserNotFoundErrorResponse) => void
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
