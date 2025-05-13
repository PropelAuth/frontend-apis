import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../../helpers/errors'
import { LoggedInVisitor, makeRequest } from '../../helpers/request'

/////////////////
///////////////// Success Responses
/////////////////
export interface MfaEnabledResponse {
    type: 'Enabled'
    mfa_enabled: true
    backup_codes: string[]
}

export interface MfaDisabledResponse {
    type: 'Disabled'
    mfa_enabled: false
    new_secret: string
    new_qr: string
}

export type MfaStatusResponse = MfaEnabledResponse | MfaDisabledResponse

/////////////////
///////////////// Errors specific to this request
/////////////////
export type MfaStatusErrorResponse = UnauthorizedResponse | UnexpectedErrorResponse | EmailNotConfirmedResponse

/////////////////
///////////////// Visitor
/////////////////
export type MfaStatusVisitor = LoggedInVisitor & {
    success: (response: MfaStatusResponse) => MfaStatusResponse | void
    unauthorized?: (error: UnauthorizedResponse) => void
    emailNotConfirmed?: (error: EmailNotConfirmedResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type FetchMfaStatusWithNewSecretFn = ReturnType<typeof fetchMfaStatusWithNewSecret>

export const fetchMfaStatusWithNewSecret = (authUrl: string, excludeBasePath?: boolean) => async () => {
    return await makeRequest<MfaStatusVisitor, MfaStatusErrorResponse, MfaStatusResponse>({
        authUrl,
        excludeBasePath,
        path: '/security_status',
        method: 'POST',
        parseResponseAsJson: true,
        responseToSuccessHandler: (response, visitor) => {
            return () => visitor.success(response)
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
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
    const apiCall = fetchMfaStatusWithNewSecret('https://auth.example.com')
    const response = await apiCall()

    response.handle({
        success: (response) => {
            console.log(response)
        },
        unauthorized: (error) => {
            console.log('Unauthorized')
            console.log(error.user_facing_error)
        },
        unexpectedOrUnhandled: (error) => {
            console.log('Unexpected or unhandled error', error)
        },
    })
}
