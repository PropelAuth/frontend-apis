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
} from '../helpers/errors'
import { Visitor, makeRequest } from '../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type UpdateOrgSettingsRequest = {
    org_id: string
    name?: string
    autojoin_by_domain?: boolean
    restrict_to_domain?: boolean
    require_2fa_by?: Date | null
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface UpdateOrgSettingsBadRequestResponse extends ApiErrorResponse {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        name: string
    }
    field_errors: {
        name: string
    }
}

/////////////////
///////////////// Error Responses
/////////////////
export type UpdateOrgSettingsErrorResponse =
    | UpdateOrgSettingsBadRequestResponse
    | OrgNotEnabledErrorResponse
    | OrgNotFoundErrorResponse
    | ForbiddenErrorResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse

/////////////////
///////////////// Error Visitor
/////////////////
type UpdateOrgSettingsVisitor = Visitor & {
    success: () => void
    badRequest?: (error: UpdateOrgSettingsBadRequestResponse) => void
    orgsNotEnabled?: (error: OrgNotEnabledErrorResponse) => void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
    forbidden?: (error: ForbiddenErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const updateOrgSettings = (authUrl: string) => async (request: UpdateOrgSettingsRequest) => {
    return makeRequest<UpdateOrgSettingsVisitor, UpdateOrgSettingsErrorResponse>({
        authUrl,
        path: '/update_org_metadata',
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
                case ErrorCode.ActionDisabled:
                    return getVisitorOrUndefined(visitor.orgsNotEnabled, error)
                case ErrorCode.OrgNotFound:
                    return getVisitorOrUndefined(visitor.orgNotFound, error)
                case ErrorCode.Forbidden:
                    return getVisitorOrUndefined(visitor.forbidden, error)
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
