import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import { ErrorCode, OrgNotFoundErrorResponse, UnexpectedErrorResponse } from '../../helpers/errors'
import { Visitor, makeRequest } from '../../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type SamlLoginByOrgRequest =
    | {
          org_id: string
      }
    | {
          org_name: string
      }

/////////////////
///////////////// Success and Error Responses
/////////////////
export type SamlLoginByOrgSuccessResponse = {
    login_url: string
}

export type SamlLoginByOrgErrorResponse = UnexpectedErrorResponse | OrgNotFoundErrorResponse

/////////////////
///////////////// Visitor
/////////////////
type SamlLoginByOrgVisitor = Visitor & {
    success: (data: SamlLoginByOrgSuccessResponse) => void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const samlLoginByOrg = (authUrl: string) => async (request: SamlLoginByOrgRequest) => {
    const queryParams = new URLSearchParams()
    if ('org_id' in request) {
        queryParams.append('org_id', request.org_id)
    } else {
        queryParams.append('org_name', request.org_name)
    }
    return makeRequest<SamlLoginByOrgVisitor, SamlLoginByOrgErrorResponse, SamlLoginByOrgSuccessResponse>({
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
