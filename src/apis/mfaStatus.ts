import { getVisitorOrUndefined } from '../helpers/error_utils'
import { EmailNotConfirmedResponse, ErrorCode, UnauthorizedResponse, UnexpectedErrorResponse } from '../helpers/errors'
import { Visitor, SuccessfulResponse, ErrorResponse, makeRequest } from '../helpers/request'

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
///////////////// Error Visitor
/////////////////
export interface MfaStatusVisitor extends Visitor {
    success: (response: MfaStatusResponse) => Promise<void> | void
    // These are generic error responses that can occur on any request
    unauthorized?: (error: UnauthorizedResponse) => Promise<void> | void
    emailNotConfirmed?: (error: EmailNotConfirmedResponse) => Promise<void> | void
}

/////////////////
///////////////// The actual Request
/////////////////
export const fetchMfaStatusWithNewSecret = (authUrl: string) => async () => {
    return makeRequest<
        SuccessfulResponse<MfaStatusVisitor, MfaStatusResponse>,
        MfaStatusErrorResponse,
        ErrorResponse<MfaStatusVisitor, MfaStatusErrorResponse>,
        MfaStatusVisitor,
        MfaStatusResponse
    >({
        authUrl,
        path: '/security_status',
        method: 'POST',
        parseResponseAsJson: true,
        responseToSuccessHandler: (response, visitor) => {
            return async () => await visitor.success(response)
        },
        responseToErrorHandler: (error, visitor) => {
            switch (error.error_code) {
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

async function test() {
    const response = await fetchMfaStatusWithNewSecret('https://auth.example.com')()

    // One way to handle errors
    await response.handle({
        success: async (response) => {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            console.log('Success!')
        },
        unauthorized: (error) => {
            console.log('Unauthorized')
            console.log(error.user_facing_error)
        },
        unexpectedOrUnhandled: () => {
            console.log('Unexpected or unhandled error')
        },
    })
}
