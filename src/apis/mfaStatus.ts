import { getVisitorOrUndefined } from '../helpers/error_utils'
import { EmailNotConfirmedResponse, ErrorCode, UnauthorizedResponse, UnexpectedErrorResponse } from '../helpers/errors'
import { Visitor, SuccessfulResponse, makeRequest } from '../helpers/request'

/////////////////
///////////////// Success Responses
/////////////////
export interface MfaEnabledResponse extends SuccessfulResponse<MfaStatusVisitor> {
    type: 'Enabled'
    mfa_enabled: boolean
    backup_codes: string[]
}

export interface MfaDisabledResponse extends SuccessfulResponse<MfaStatusVisitor> {
    type: 'Disabled'
    mfa_enabled: boolean
    new_secret: string
    new_qr: string
}

export type MfaStatusResponse = MfaEnabledResponse | MfaDisabledResponse

/////////////////
///////////////// Errors specific to this request
/////////////////
export type MfaStatusErrorResponse =
    | UnauthorizedResponse<MfaStatusVisitor>
    | UnexpectedErrorResponse<MfaStatusVisitor>
    | EmailNotConfirmedResponse<MfaStatusVisitor>

/////////////////
///////////////// Error Visitor
/////////////////
export interface MfaStatusVisitor extends Visitor {
    // These are generic error responses that can occur on any request
    unauthorized?: (error: UnauthorizedResponse<MfaStatusVisitor>) => Promise<void> | void
    emailNotConfirmed?: (error: EmailNotConfirmedResponse<MfaStatusVisitor>) => Promise<void> | void
}

/////////////////
///////////////// The actual Request
/////////////////
export const fetchMfaStatusWithNewSecret = (authUrl: string) => async () => {
    return makeRequest<MfaStatusResponse, MfaStatusErrorResponse, MfaStatusVisitor>({
        authUrl,
        path: '/security_status',
        method: 'POST',
        responseToHandler: (response, visitor) => {
            if (response.ok) {
                return visitor.success
            } else {
                switch (response.error_code) {
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
