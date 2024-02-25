import { getVisitorOrUndefined } from '../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    GenericErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../helpers/errors'
import { SuccessfulResponse, Visitor, makeRequest } from '../helpers/request'

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface MfaAlreadyDisabledResponse<V extends Visitor> extends GenericErrorResponse<V> {
    error_code: ErrorCode.ActionAlreadyComplete
    user_facing_error: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type MfaDisableErrorResponse =
    | MfaAlreadyDisabledResponse<MfaDisableVisitor>
    | UnauthorizedResponse<MfaDisableVisitor>
    | UnexpectedErrorResponse<MfaDisableVisitor>
    | EmailNotConfirmedResponse<MfaDisableVisitor>

export type MfaDisableSuccessfulResponse = SuccessfulResponse<MfaDisableVisitor>

/////////////////
///////////////// Error Visitor
/////////////////
export interface MfaDisableVisitor extends Visitor {
    alreadyDisabled: (error: MfaAlreadyDisabledResponse<MfaDisableVisitor>) => Promise<void> | void

    // These are generic error responses that can occur on any request
    unauthorized?: (error: UnauthorizedResponse<MfaDisableVisitor>) => Promise<void> | void
    emailNotConfirmed?: (error: EmailNotConfirmedResponse<MfaDisableVisitor>) => Promise<void> | void
}

/////////////////
///////////////// The actual Request
/////////////////
export const disableMfa = (authUrl: string) => async () => {
    return makeRequest<MfaDisableSuccessfulResponse, MfaDisableErrorResponse, MfaDisableVisitor>({
        authUrl,
        path: '/mfa_disable',
        method: 'POST',
        responseToHandler: (response, visitor) => {
            if (response.ok) {
                return visitor.success
            } else {
                switch (response.error_code) {
                    case ErrorCode.ActionAlreadyComplete:
                        return getVisitorOrUndefined(visitor.alreadyDisabled, response)
                    case ErrorCode.Unauthorized:
                        return getVisitorOrUndefined(visitor.unauthorized, response)
                    case ErrorCode.EmailNotConfirmed:
                        return getVisitorOrUndefined(visitor.emailNotConfirmed, response)
                    case ErrorCode.UnexpectedError:
                        return visitor.unexpectedOrUnhandled
                }
            }
        },
    })
}
