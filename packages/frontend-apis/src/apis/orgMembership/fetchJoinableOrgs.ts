import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    OrgsNotEnabledErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../../helpers/errors'
import { Visitor, makeRequest } from '../../helpers/request'

/////////////////
///////////////// Success Response
/////////////////
export type JoinableOrg = {
    id: string
    name: string
}
export type FetchJoinableOrgsSuccessResponse = {
    orgs: JoinableOrg[]
}

/////////////////
///////////////// Error Responses
/////////////////
export type FetchJoinableOrgsErrorResponse =
    | OrgsNotEnabledErrorResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse

/////////////////
///////////////// Error Visitor
/////////////////
export type FetchJoinableOrgsVisitor = Visitor & {
    success: (data: FetchJoinableOrgsSuccessResponse) => void
    orgsNotEnabled?: (error: OrgsNotEnabledErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type FetchJoinableOrgsFn = ReturnType<typeof fetchJoinableOrgs>

export const fetchJoinableOrgs = (authUrl: string) => async () => {
    return makeRequest<FetchJoinableOrgsVisitor, FetchJoinableOrgsErrorResponse, FetchJoinableOrgsSuccessResponse>({
        authUrl,
        path: `/joinable_orgs`,
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
