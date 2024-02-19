import { getVisitorOrUndefined } from '../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    ErrorVisitor,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../helpers/errors'
import { makeRequest } from '../helpers/request'

/////////////////
///////////////// Success Responses
/////////////////
export interface MfaEnabledResponse {
    ok: true
    type: 'Enabled'
    mfa_enabled: boolean
    backup_codes: string[]
}

export interface MfaDisabledResponse {
    ok: true
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
    | UnauthorizedResponse<MfaStatusErrorVisitor>
    | UnexpectedErrorResponse<MfaStatusErrorVisitor>
    | EmailNotConfirmedResponse<MfaStatusErrorVisitor>

/////////////////
///////////////// Error Visitor
/////////////////
export interface MfaStatusErrorVisitor extends ErrorVisitor {
    // These are generic error responses that can occur on any request
    unauthorized?: (error: UnauthorizedResponse<MfaStatusErrorVisitor>) => void
    emailNotConfirmed?: (error: EmailNotConfirmedResponse<MfaStatusErrorVisitor>) => void
    unexpectedOrUnhandled?: () => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const fetchMfaStatusWithNewSecret = (authUrl: string) => async () => {
    return makeRequest<MfaStatusResponse, MfaStatusErrorResponse, MfaStatusErrorVisitor>({
        authUrl,
        path: '/security_status',
        method: 'POST',
        errorToHandler: (error, visitor) => {
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
