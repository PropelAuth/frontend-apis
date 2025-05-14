import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    GenericErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../../helpers/errors'
import { LoggedInVisitor, makeRequest } from '../../helpers/request'

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
///////////////// Visitor
/////////////////
export type MfaDisableVisitor = LoggedInVisitor & {
    success: () => void
    alreadyDisabled?: (error: MfaAlreadyDisabledResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type DisableMfaFn = ReturnType<typeof disableMfa>

export const disableMfa = (authUrl: string) => async () => {
    return makeRequest<MfaDisableVisitor, MfaDisableErrorResponse>({
        authUrl,
        path: '/mfa_disable',
        method: 'POST',
        responseToSuccessHandler: (visitor) => {
            return async () => await visitor.success()
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.ActionAlreadyComplete:
                    return getVisitorOrUndefined(visitor.alreadyDisabled, error)
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function example() {
    const apiCall = disableMfa('https://auth.example.com')
    const response = await apiCall()

    response.handle({
        success: async () => {
            console.log('MFA enabled')
        },
        alreadyDisabled: (error) => {
            console.log('MFA already disabled', error)
        },
    })
}
