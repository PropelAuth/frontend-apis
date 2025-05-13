import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import {
    ApiErrorForSpecificFields,
    EmailNotConfirmedResponse,
    ErrorCode,
    ForbiddenErrorResponse,
    OrgsNotEnabledErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
    UserNotFoundErrorResponse,
} from '../helpers/errors'
import { LoggedInVisitor, makeRequest } from '../helpers/request'

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
export interface UpdateUserRoleInOrgFieldValidationErrorResponse extends ApiErrorForSpecificFields {
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

/////////////////
///////////////// Success and Error Responses
/////////////////
export type UpdateUserRoleInOrgErrorResponse =
    | UpdateUserRoleInOrgFieldValidationErrorResponse
    | OrgsNotEnabledErrorResponse
    | UserNotFoundErrorResponse
    | ForbiddenErrorResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | UnauthorizedResponse

/////////////////
///////////////// Visitor
/////////////////
export type UpdateUserRoleInOrgVisitor = LoggedInVisitor & {
    success: () => void
    badRequest?: (error: UpdateUserRoleInOrgFieldValidationErrorResponse) => void
    noUpdateRolePermission?: (error: ForbiddenErrorResponse) => void
    userNotFoundInOrg?: (error: UserNotFoundErrorResponse) => void
    orgsNotEnabled?: (error: OrgsNotEnabledErrorResponse) => void
}
/////////////////
///////////////// The actual Request
/////////////////
export type UpdateUserRoleInOrgFn = ReturnType<typeof updateUserRoleInOrg>

export const updateUserRoleInOrg =
    (authUrl: string, excludeBasePath?: boolean) => async (request: UpdateUserRoleInOrgRequest) => {
        return makeRequest<UpdateUserRoleInOrgVisitor, UpdateUserRoleInOrgErrorResponse>({
            authUrl,
            excludeBasePath,
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
