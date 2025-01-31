import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import { ErrorCode, OrgNotFoundErrorResponse, UnexpectedErrorResponse } from '../../helpers/errors'
import { makeRequest, Visitor } from '../../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type LoginViaSamlForOrgRequest =
    | {
          domain: string
      }
    | {
          email: string
      }
    | {
          org_id: string
      }

/////////////////
///////////////// Success and Error Responses
/////////////////
export type LoginViaSamlForOrgSuccessfulResponse = {
    login_url: string
}

export type LoginViaSamlForOrgErrorResponse = UnexpectedErrorResponse | OrgNotFoundErrorResponse

/////////////////
///////////////// Visitor
/////////////////
export type LoginViaSamlForOrgVisitor = Visitor & {
    success: (data: LoginViaSamlForOrgSuccessfulResponse) => void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type LoginViaSamlForOrgFn = ReturnType<typeof loginViaSamlForOrg>

export const loginViaSamlForOrg = (authUrl: string) => async (request: LoginViaSamlForOrgRequest) => {
    const queryParams = new URLSearchParams()
    if ('domain' in request) {
        queryParams.append('domain', request.domain)
    } else if ('org_id' in request) {
        queryParams.append('org_id', request.org_id)
    } else {
        queryParams.append('email', request.email)
    }
    return makeRequest<
        LoginViaSamlForOrgVisitor,
        LoginViaSamlForOrgErrorResponse,
        LoginViaSamlForOrgSuccessfulResponse
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
