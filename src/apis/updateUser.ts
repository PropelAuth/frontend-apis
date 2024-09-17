import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    ApiErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../helpers/errors'
import { Visitor, makeRequest } from '../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type UpdateUserFacingMetadataRequest = {
    username?: string
    first_name?: string
    last_name?: string
    properties?: { [key: string]: unknown }
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface UpdateMetadataBadRequestResponse extends ApiErrorResponse {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        username?: string
        first_name?: string
        last_name?: string
        properties?: string
    }
    field_errors: {
        username?: string
        first_name?: string
        last_name?: string
        properties?: string
    }
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type UpdateUserFacingMetadataErrorResponse =
    | UpdateMetadataBadRequestResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse

/////////////////
///////////////// Error Visitor
/////////////////
type UpdateUserFacingMetadataVisitor = Visitor & {
    success: () => Promise<void> | void
    badRequest: (error: UpdateMetadataBadRequestResponse) => Promise<void> | void
}

/////////////////
///////////////// The actual Request
/////////////////
export const updateUserFacingMetadata = (authUrl: string) => async (request: UpdateUserFacingMetadataRequest) => {
    return makeRequest<UpdateUserFacingMetadataVisitor, UpdateUserFacingMetadataErrorResponse>({
        authUrl,
        path: '/update_metadata',
        method: 'POST',
        body: request,
        responseToSuccessHandler: (visitor) => {
            return async () => await visitor.success()
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.InvalidRequestFields:
                    return getVisitorOrUndefined(visitor.badRequest, error)
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
