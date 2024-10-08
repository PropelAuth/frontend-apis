import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import {
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
///////////////// Success Response
/////////////////
export type FetchOrgSettingsSuccessResponse = {
    org_name: string
    user_can_update_org_settings: boolean
    user_can_update_metadata: boolean
    autojoin_by_domain: boolean
    restrict_to_domain: boolean
    // `require_2fa_by`'s format is a string of format "YYYY-MM-DDTHH:MM:SSZ" or null
    require_2fa_by: string | null
    existing_domain: string | null
    current_user_domain: string
    current_user_domain_is_personal: boolean

    can_setup_saml: boolean
    is_saml_enabled: boolean
    is_saml_in_test_mode: boolean
    can_setup_scim: boolean
    is_scim_enabled: boolean
}

/////////////////
///////////////// Error Responses
/////////////////
export type FetchOrgSettingsErrorResponse =
    | OrgNotEnabledErrorResponse
    | OrgNotFoundErrorResponse
    | UserNotFoundErrorResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse

/////////////////
///////////////// Error Visitor
/////////////////
type FetchOrgSettingsVisitor = Visitor & {
    success: (data: FetchOrgSettingsSuccessResponse) => void
    orgsNotEnabled?: (error: OrgNotEnabledErrorResponse) => void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
    userNotFoundInOrg?: (error: UserNotFoundErrorResponse) => void
    forbidden?: (error: ForbiddenErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const fetchOrgSettings = (authUrl: string) => async (orgId: string) => {
    return makeRequest<FetchOrgSettingsVisitor, FetchOrgSettingsErrorResponse, FetchOrgSettingsSuccessResponse>({
        authUrl,
        path: `/org_settings?org_id=${orgId}`,
        method: 'GET',
        parseResponseAsJson: true,
        responseToSuccessHandler: (response, visitor) => {
            return () => visitor.success(response)
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.ActionDisabled:
                    return getVisitorOrUndefined(visitor.orgsNotEnabled, error)
                case ErrorCode.OrgNotFound:
                    return getVisitorOrUndefined(visitor.orgNotFound, error)
                case ErrorCode.UserNotFound:
                    return getVisitorOrUndefined(visitor.userNotFoundInOrg, error)
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
