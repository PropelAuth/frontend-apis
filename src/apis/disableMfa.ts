import { getVisitorOrUndefined } from '../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    ErrorVisitor,
    GenericErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../helpers/errors'
import { makeRequest } from '../helpers/request'

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface MfaAlreadyDisabledResponse<V extends ErrorVisitor> extends GenericErrorResponse<V> {
    error_code: ErrorCode.ActionAlreadyComplete
    user_facing_error: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type MfaDisableErrorResponse =
    | MfaAlreadyDisabledResponse<MfaDisableErrorVisitor>
    | UnauthorizedResponse<MfaDisableErrorVisitor>
    | UnexpectedErrorResponse<MfaDisableErrorVisitor>
    | EmailNotConfirmedResponse<MfaDisableErrorVisitor>

export type MfaDisableSuccessResponse = {
    ok: true
}

/////////////////
///////////////// Error Visitor
/////////////////
export interface MfaDisableErrorVisitor extends ErrorVisitor {
    alreadyDisabled: (error: MfaAlreadyDisabledResponse<MfaDisableErrorVisitor>) => void

    // These are generic error responses that can occur on any request
    unauthorized?: (error: UnauthorizedResponse<MfaDisableErrorVisitor>) => void
    emailNotConfirmed?: (error: EmailNotConfirmedResponse<MfaDisableErrorVisitor>) => void
    unexpectedOrUnhandled?: () => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const disableMfa = (authUrl: string) => async () => {
    return makeRequest<MfaDisableSuccessResponse, MfaDisableErrorResponse, MfaDisableErrorVisitor>({
        authUrl,
        path: '/mfa_disable',
        method: 'POST',
        errorToHandler: (error, visitor) => {
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
