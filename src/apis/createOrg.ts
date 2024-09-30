import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import {
    ApiErrorResponse,
    EmailNotConfirmedResponse,
    ErrorCode,
    GenericErrorResponse,
    OrgMaxUsersLimitExceededErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
    UserMaxOrgsLimitExceededErrorResponse,
} from '../helpers/errors'
import { Visitor, makeRequest } from '../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type CreateOrgRequest = {
    name: string
    autojoin_by_domain: boolean
    restrict_to_domain: boolean
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface CreateOrgBadRequestResponse extends ApiErrorResponse {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        name: string
    }
    field_errors: {
        name: string
    }
}

export interface CreateOrgDisabledResponse extends GenericErrorResponse {
    error_code: ErrorCode.ActionDisabled
}

export interface CreateOrgPersonalDomainError extends GenericErrorResponse {
    error_code: ErrorCode.PersonalDomainError
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type CreateOrgSuccessResponse = {
    org_id: string
    first_org: boolean
}

export type CreateOrgErrorResponse =
    | CreateOrgBadRequestResponse
    | CreateOrgDisabledResponse
    | CreateOrgPersonalDomainError
    | UserMaxOrgsLimitExceededErrorResponse
    | OrgMaxUsersLimitExceededErrorResponse
    | UnauthorizedResponse
    | EmailNotConfirmedResponse
    | UnexpectedErrorResponse

/////////////////
///////////////// Error Visitor
/////////////////
type CreateOrgVisitor = Visitor & {
    success: (data: CreateOrgSuccessResponse) => void
    badRequest?: (error: CreateOrgBadRequestResponse) => void
    cannotCreateOrgs?: (error: CreateOrgDisabledResponse) => void
    cannotUsePersonalDomain?: (error: CreateOrgPersonalDomainError) => void
    userAlreadyInTooManyOrgs?: (error: UserMaxOrgsLimitExceededErrorResponse) => void
    orgMaxUsersLimitExceeded?: (error: OrgMaxUsersLimitExceededErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const createOrg = (authUrl: string) => async (request: CreateOrgRequest) => {
    return makeRequest<CreateOrgVisitor, CreateOrgErrorResponse, CreateOrgSuccessResponse>({
        authUrl,
        path: '/create_org',
        parseResponseAsJson: true,
        method: 'POST',
        body: request,
        responseToSuccessHandler: (response, visitor) => {
            return () => visitor.success(response)
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.InvalidRequestFields:
                    return getVisitorOrUndefined(visitor.badRequest, error)
                case ErrorCode.ActionDisabled:
                    return getVisitorOrUndefined(visitor.cannotCreateOrgs, error)
                case ErrorCode.PersonalDomainError:
                    return getVisitorOrUndefined(visitor.cannotUsePersonalDomain, error)
                case ErrorCode.UserMaxOrgsLimitExceeded:
                    return getVisitorOrUndefined(visitor.userAlreadyInTooManyOrgs, error)
                case ErrorCode.OrgMaxUsersLimitExceeded:
                    return getVisitorOrUndefined(visitor.orgMaxUsersLimitExceeded, error)
                case ErrorCode.Unauthorized:
                    return getVisitorOrUndefined(visitor.unauthorized, error)
                case ErrorCode.UnexpectedError:
                    return getVisitorOrUndefined(visitor.unexpectedOrUnhandled, error)
                case ErrorCode.EmailNotConfirmed:
                    return getVisitorOrUndefined(visitor.emailNotConfirmed, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
