import { getVisitorOrUndefined } from '../helpers/error_utils'
import { ErrorCode, ErrorResponse, UnauthorizedResponse, UnexpectedErrorResponse } from '../helpers/errors'
import { makeRequest, SuccessfulResponse, Visitor } from '../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type UpdateUserRequest = {
    username?: string
    firstName?: string
    lastName?: string
    properties?: { [key: string]: unknown }
}

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface UpdateUserBadRequestResponse<V extends Visitor> extends ErrorResponse<V> {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: { [key: string]: string }
    field_errors: { [key: string]: string }
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type UpdateUserErrorResponse =
    | UpdateUserBadRequestResponse<UpdateUserVisitor>
    | UnauthorizedResponse<UpdateUserVisitor>
    | UnexpectedErrorResponse<UpdateUserVisitor>

export type UpdateUserSuccessfulResponse = SuccessfulResponse<UpdateUserVisitor>

/////////////////
///////////////// Error Visitor
/////////////////
export interface UpdateUserVisitor extends Visitor {
    badRequest: (error: UpdateUserBadRequestResponse<UpdateUserVisitor>) => Promise<void> | void

    unauthorized?: (error: UnauthorizedResponse<UpdateUserVisitor>) => Promise<void> | void
}

/////////////////
///////////////// The actual Request
/////////////////
export const updateUser = (authUrl: string) => async (req: UpdateUserRequest) => {
    const body = {
        username: req.username,
        first_name: req.firstName,
        last_name: req.lastName,
        properties: req.properties,
    }

    return makeRequest<UpdateUserSuccessfulResponse, UpdateUserErrorResponse, UpdateUserVisitor>({
        authUrl,
        path: '/update_metadata',
        method: 'POST',
        body,
        responseToHandler: (response, visitor) => {
            if (response.ok) {
                return visitor.success
            }

            switch (response.error_code) {
                case ErrorCode.InvalidRequestFields:
                    return getVisitorOrUndefined(visitor.badRequest, response)
                case ErrorCode.Unauthorized:
                    return getVisitorOrUndefined(visitor.unauthorized, response)
                case ErrorCode.UnexpectedError:
                    return visitor.unexpectedOrUnhandled
            }
        },
    })
}
