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
export type UpdateUserRoleInOrgRequest = {
    org_id: string
    user_id: string
    role: string
    additional_roles?: string[]
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface OrgNotEnabledErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.ActionDisabled
    user_facing_error: string
}

export interface UpdateUserRoleInOrgFieldValidationErrorResponse extends ApiErrorResponse {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        org_id?: string
        role?: string
    }
    field_errors: {
        org_id?: string
        role?: string
    }
}

export interface ForbiddenErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.Forbidden
    user_facing_error: string
}

export interface UserNotFoundErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.UserNotFound
    user_facing_error: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type UpdateUserRoleInOrgErrorResponse =
    | UpdateUserRoleInOrgFieldValidationErrorResponse
    | OrgNotEnabledErrorResponse
    | UserNotFoundErrorResponse
    | ForbiddenErrorResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | UnauthorizedResponse

/////////////////
///////////////// Visitor
/////////////////
type UpdateUserRoleInOrgVisitor = Visitor & {
    success: () => void
    badRequest?: (error: UpdateUserRoleInOrgFieldValidationErrorResponse) => void
    noUpdateRolePermission?: (error: ForbiddenErrorResponse) => void
    userNotFound?: (error: UserNotFoundErrorResponse) => void
    orgNotEnabled?: (error: OrgNotEnabledErrorResponse) => void
}
/////////////////
///////////////// The actual Request
/////////////////
export const updateUserRoleInOrg = (authUrl: string) => async (request: UpdateUserRoleInOrgRequest) => {
    return makeRequest<UpdateUserRoleInOrgVisitor, UpdateUserRoleInOrgErrorResponse>({
        authUrl,
        path: '/change_role',
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
                    return getVisitorOrUndefined(visitor.noUpdateRolePermission, error)
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
