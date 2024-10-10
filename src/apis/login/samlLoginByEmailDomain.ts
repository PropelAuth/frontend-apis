import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import { ErrorCode, UnexpectedErrorResponse } from '../../helpers/errors'
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
export type SamlLoginByEmailDomainErrorResponse = UnexpectedErrorResponse

/////////////////
///////////////// Visitor
/////////////////
type SamlLoginByEmailDomainVisitor = Visitor

/////////////////
///////////////// The actual Request
/////////////////
export const samlLoginByEmailDomain = (authUrl: string) => async (request: SamlLoginByEmailDomainRequest) => {
    return makeRequest<SamlLoginByEmailDomainVisitor, SamlLoginByEmailDomainErrorResponse>({
        authUrl,
        path: '/login/saml',
        method: 'GET',
        body: request,
        responseToSuccessHandler: () => {
            return () => {}
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.UnexpectedError:
                    return getVisitorOrUndefined(visitor.unexpectedOrUnhandled, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
