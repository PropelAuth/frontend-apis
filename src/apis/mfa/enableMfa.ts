/////////////////
///////////////// Request

import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    ApiErrorResponse,
    ErrorCode,
    GenericErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
    EmailNotConfirmedResponse,
} from '../../helpers/errors'
import { makeRequest, Visitor } from '../../helpers/request'

/////////////////
export type MfaEnableRequest = {
    code: string
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface MfaEnableBadRequestResponse extends ApiErrorResponse {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        code: string
    }
    field_errors: {
        code: string
    }
}

export interface MfaAlreadyEnabledResponse extends GenericErrorResponse {
    error_code: ErrorCode.ActionAlreadyComplete
    user_facing_error: string
}

export interface MfaIncorrectCodeResponse extends GenericErrorResponse {
    error_code: ErrorCode.Forbidden
    user_facing_error: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type MfaEnableErrorResponse =
    | MfaEnableBadRequestResponse
    | MfaAlreadyEnabledResponse
    | MfaIncorrectCodeResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse

/////////////////
///////////////// Error Visitor
/////////////////
type MfaEnableVisitor = Visitor & {
    success: () => void
    badRequest?: (error: MfaEnableBadRequestResponse) => void
    alreadyEnabled?: (error: MfaAlreadyEnabledResponse) => void
    incorrectCode?: (error: MfaIncorrectCodeResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const enableMfa = (authUrl: string) => async (request: MfaEnableRequest) => {
    return makeRequest<MfaEnableVisitor, MfaEnableErrorResponse>({
        authUrl,
        path: '/mfa_enable',
        method: 'POST',
        body: request,
        responseToSuccessHandler: (visitor) => {
            return () => visitor.success()
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.InvalidRequestFields:
                    return getVisitorOrUndefined(visitor.badRequest, error)
                case ErrorCode.ActionAlreadyComplete:
                    return getVisitorOrUndefined(visitor.alreadyEnabled, error)
                case ErrorCode.Forbidden:
                    return getVisitorOrUndefined(visitor.incorrectCode, error)
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
    const apiCall = enableMfa('https://auth.example.com')
    const response = await apiCall({ code: '123456' })

    await response.handle({
        success: async () => {
            console.log('MFA enabled')
        },
        badRequest: (error) => {
            console.log('Bad request', error)
        },
        alreadyEnabled: (error) => {
            console.log('MFA already enabled', error)
        },
        incorrectCode: (error) => {
            console.log('Incorrect code', error)
        },
    })
}
