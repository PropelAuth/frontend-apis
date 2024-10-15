import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import { ErrorCode, OrgNotFoundErrorResponse, UnexpectedErrorResponse } from '../../helpers/errors'
import { Visitor, makeRequest } from '../../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type SamlLoginByEmailDomainRequest =
    | {
          domain: string
      }
    | {
          email: string
      }

/////////////////
///////////////// Success and Error Responses
/////////////////
export type SamlLoginByEmailDomainSuccessResponse = {
    login_url: string
}

export type SamlLoginByEmailDomainErrorResponse = UnexpectedErrorResponse | OrgNotFoundErrorResponse

/////////////////
///////////////// Visitor
/////////////////
type SamlLoginByEmailDomainVisitor = Visitor & {
    success: (data: SamlLoginByEmailDomainSuccessResponse) => void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const samlLoginByEmailDomain = (authUrl: string) => async (request: SamlLoginByEmailDomainRequest) => {
    const queryParams = new URLSearchParams()
    if ('domain' in request) {
        queryParams.append('domain', request.domain)
    } else {
        queryParams.append('email', request.email)
    }
    return makeRequest<
        SamlLoginByEmailDomainVisitor,
        SamlLoginByEmailDomainErrorResponse,
        SamlLoginByEmailDomainSuccessResponse
    >({
        authUrl,
        path: '/login/check',
        method: 'GET',
        queryParams,
        parseResponseAsJson: true,
        responseToSuccessHandler: (response, visitor) => {
            return () => {
                window.location.href = response.login_url
                visitor.success(response)
            }
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.UnexpectedError:
                    return getVisitorOrUndefined(visitor.unexpectedOrUnhandled, error)
                case ErrorCode.OrgNotFound:
                    return getVisitorOrUndefined(visitor.orgNotFound, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
