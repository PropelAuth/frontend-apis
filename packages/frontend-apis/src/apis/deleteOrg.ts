import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import {
    ErrorCode,
    ForbiddenErrorResponse,
    GenericErrorResponse,
    OrgNotFoundErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../helpers/errors'
import { LoggedInVisitor, makeRequest } from '../helpers/request'

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface DeleteOrgDisabledResponse extends GenericErrorResponse {
    error_code: ErrorCode.ActionDisabled
    user_facing_error: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type DeleteOrgErrorResponse =
    | DeleteOrgDisabledResponse
    | OrgNotFoundErrorResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | ForbiddenErrorResponse

/////////////////
///////////////// Error Visitor
/////////////////
export type DeleteOrgVisitor = LoggedInVisitor & {
    success: () => void
    actionDisabled?: (error: DeleteOrgDisabledResponse) => void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
    noDeletePermission?: (error: ForbiddenErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type DeleteOrgFn = ReturnType<typeof deleteOrg>

export const deleteOrg = (authUrl: string, excludeBasePath?: boolean) => async (orgId: string) => {
    return makeRequest<DeleteOrgVisitor, DeleteOrgErrorResponse>({
        authUrl,
        excludeBasePath,
        path: '/delete_org',
        method: 'DELETE',
        body: { org_id: orgId },
        responseToSuccessHandler: (visitor) => {
            return () => visitor.success()
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.ActionDisabled:
                    return getVisitorOrUndefined(visitor.actionDisabled, error)
                case ErrorCode.Unauthorized:
                    return getVisitorOrUndefined(visitor.unauthorized, error)
                case ErrorCode.UnexpectedError:
                    return getVisitorOrUndefined(visitor.unexpectedOrUnhandled, error)
                case ErrorCode.OrgNotFound:
                    return getVisitorOrUndefined(visitor.orgNotFound, error)
                case ErrorCode.Forbidden:
                    return getVisitorOrUndefined(visitor.noDeletePermission, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
