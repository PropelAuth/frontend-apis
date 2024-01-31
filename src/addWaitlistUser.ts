import {
    UnauthorizedResponse,
    UnexpectedErrorResponse,
    EmailNotConfirmedResponse,
    ErrorVisitor,
    ForbiddenErrorResponse,
    GenericErrorResponse,
    ErrorResponse,
} from './errors'
import { makeRequest } from './request'

/////////////////
///////////////// Request
/////////////////
export type AddWaitlistUserRequestBody = {
    email: string
    properties: Record<string, unknown>
    first_name?: string
    last_name?: string
    username?: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type AddWaitlistUserErrorResponse =
    | UnexpectedErrorResponse<AddWaitlistUserErrorVisitor>
    | EmailNotConfirmedResponse<AddWaitlistUserErrorVisitor>
    | UnauthorizedResponse<AddWaitlistUserErrorVisitor>
    | ForbiddenErrorResponse<AddWaitlistUserErrorVisitor>
    | EmailDomainNotAllowedError

export type AddWaitlistUserSuccessResponse = {
    ok: true
}

/////////////////
///////////////// Error Visitor
/////////////////
interface AddWaitlistUserErrorVisitor extends ErrorVisitor {
    // These are generic error responses that can occur on any request
    unauthorized?: (error: UnauthorizedResponse<AddWaitlistUserErrorVisitor>) => void
    forbidden?: (error: ForbiddenErrorResponse<AddWaitlistUserErrorVisitor>) => void
    emailNotConfirmed?: (error: EmailNotConfirmedResponse<AddWaitlistUserErrorVisitor>) => void
    unexpectedOrUnhandled?: () => void
    emailDomainNotAllowed?: (error: EmailDomainNotAllowedError) => void
}

type EmailDomainNotAllowedError = ErrorResponse<AddWaitlistUserErrorVisitor> & {
    error_code: 'bad_request'
    user_facing_error: 'You cannot sign up with a personal email address.'
}

/////////////////
///////////////// The actual request
/////////////////
export const addWaitlistUser = async (request: AddWaitlistUserRequestBody) => {
    return makeRequest<AddWaitlistUserSuccessResponse, AddWaitlistUserErrorResponse, AddWaitlistUserErrorVisitor>({
        path: '/add_waitlist_user',
        method: 'POST',
        body: request,
    })
}
