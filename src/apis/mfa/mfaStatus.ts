import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../../helpers/errors'
import { Visitor, makeRequest } from '../../helpers/request'

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
type MfaStatusVisitor = Visitor & {
    success: (response: MfaStatusResponse) => Promise<void> | void
    unauthorized?: (error: UnauthorizedResponse) => Promise<void> | void
    emailNotConfirmed?: (error: EmailNotConfirmedResponse) => Promise<void> | void
}

/////////////////
///////////////// The actual Request
/////////////////
export const fetchMfaStatusWithNewSecret = (authUrl: string) => async () => {
    const res = await makeRequest<
        // SuccessfulResponse<MfaStatusVisitor, MfaStatusResponse>,
        MfaStatusVisitor,
        MfaStatusErrorResponse,
        MfaStatusResponse
        // ErrorResponse<MfaStatusVisitor, MfaStatusErrorResponse>,
    >({
        authUrl,
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

    return res
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
