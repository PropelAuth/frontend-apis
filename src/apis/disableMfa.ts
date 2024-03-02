import { getVisitorOrUndefined } from '../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    GenericErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../helpers/errors'
import { SuccessfulResponse, ErrorResponse, Visitor, makeRequest } from '../helpers/request'

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface MfaAlreadyDisabledResponse extends GenericErrorResponse {
    error_code: ErrorCode.ActionAlreadyComplete
    user_facing_error: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type MfaDisableErrorResponse =
    | MfaAlreadyDisabledResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse

/////////////////
///////////////// Error Visitor
/////////////////
export interface MfaDisableVisitor extends Visitor {
    success: () => Promise<void> | void
    alreadyDisabled: (error: MfaAlreadyDisabledResponse) => Promise<void> | void

    // These are generic error responses that can occur on any request
    unauthorized?: (error: UnauthorizedResponse) => Promise<void> | void
    emailNotConfirmed?: (error: EmailNotConfirmedResponse) => Promise<void> | void
}

/////////////////
///////////////// The actual Request
/////////////////
export const disableMfa = (authUrl: string) => async () => {
    return makeRequest<
        SuccessfulResponse<MfaDisableVisitor>,
        MfaDisableErrorResponse,
        ErrorResponse<MfaDisableVisitor, MfaDisableErrorResponse>,
        MfaDisableVisitor
    >({
        authUrl,
        path: '/mfa_disable',
        method: 'POST',
        responseToSuccessHandler: (visitor) => {
            return async () => await visitor.success()
        },
        responseToErrorHandler: (error, visitor) => {
            switch (error.error_code) {
                case ErrorCode.ActionAlreadyComplete:
                    return getVisitorOrUndefined(visitor.alreadyDisabled, error)
                case ErrorCode.Unauthorized:
                    return getVisitorOrUndefined(visitor.unauthorized, error)
                case ErrorCode.EmailNotConfirmed:
                    return getVisitorOrUndefined(visitor.emailNotConfirmed, error)
                case ErrorCode.UnexpectedError:
                    return visitor.unexpectedOrUnhandled
            }
        },
    })
}

async function example() {
    const apiCall = disableMfa('https://auth.example.com')
    const response = await apiCall()

    await response.handle({
        success: async () => {
            console.log('MFA enabled')
        },
        alreadyDisabled: (error) => {
            console.log('MFA already disabled', error)
        },
    })
}
