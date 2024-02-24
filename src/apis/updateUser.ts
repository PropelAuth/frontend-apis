// import { getVisitorOrUndefined } from '../helpers/error_utils'
// import {
//     ErrorCode,
//     ErrorResponse,
//     ErrorVisitor,
//     UnauthorizedResponse,
//     UnexpectedErrorResponse,
// } from '../helpers/errors'
// import { makeRequest } from '../helpers/request'

// /////////////////
// ///////////////// Request
// /////////////////
// export type UpdateUserRequest = {
//     username?: string
//     firstName?: string
//     lastName?: string
//     properties?: { [key: string]: unknown }
// }

// /////////////////
// ///////////////// Errors specific to this request
// /////////////////
// export interface UpdateUserBadRequestResponse<V extends ErrorVisitor> extends ErrorResponse<V> {
//     error_code: ErrorCode.InvalidRequestFields
//     user_facing_errors: { [key: string]: string }
//     field_errors: { [key: string]: string }
// }

// /////////////////
// ///////////////// Success and Error Responses
// /////////////////
// export type UpdateUserErrorResponse =
//     | UpdateUserBadRequestResponse<UpdateUserErrorVisitor>
//     | UnauthorizedResponse<UpdateUserErrorVisitor>
//     | UnexpectedErrorResponse<UpdateUserErrorVisitor>

// export type UpdateUserSuccessfulResponse = {
//     ok: true
// }

// /////////////////
// ///////////////// Error Visitor
// /////////////////
// export interface UpdateUserErrorVisitor extends ErrorVisitor {
//     badRequest: (error: UpdateUserBadRequestResponse<UpdateUserErrorVisitor>) => void

//     unauthorized?: (error: UnauthorizedResponse<UpdateUserErrorVisitor>) => void
//     unexpectedOrUnhandled?: () => void
// }

// /////////////////
// ///////////////// The actual Request
// /////////////////
// export const updateUser = (authUrl: string) => async (req: UpdateUserRequest) => {
//     const body = {
//         username: req.username,
//         first_name: req.firstName,
//         last_name: req.lastName,
//         properties: req.properties,
//     }

//     return makeRequest<UpdateUserSuccessfulResponse, UpdateUserErrorResponse, UpdateUserErrorVisitor>({
//         authUrl,
//         path: '/update_metadata',
//         method: 'POST',
//         body,
//         errorToHandler: (error, visitor) => {
//             switch (error.error_code) {
//                 case ErrorCode.InvalidRequestFields:
//                     return getVisitorOrUndefined(visitor.badRequest, error)
//                 case ErrorCode.Unauthorized:
//                     return getVisitorOrUndefined(visitor.unauthorized, error)
//                 case ErrorCode.UnexpectedError:
//                     return visitor.unexpectedOrUnhandled
//             }
//         },
//     })
// }
