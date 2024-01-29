import {
    UnauthorizedResponse,
    UnexpectedErrorResponse,
    EmailNotConfirmedResponse,
    ErrorVisitor,
    ForbiddenErrorResponse,
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
    send_confirmation_email: boolean
    set_email_as_confirmed: boolean
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type AddWaitlistUserErrorResponse =
    | UnexpectedErrorResponse<AddWaitlistUserErrorVisitor>
    | EmailNotConfirmedResponse<AddWaitlistUserErrorVisitor>
    | UnauthorizedResponse<AddWaitlistUserErrorVisitor>
    | ForbiddenErrorResponse<AddWaitlistUserErrorVisitor>

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
