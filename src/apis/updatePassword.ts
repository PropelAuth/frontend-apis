// import { getVisitorOrUndefined } from '../helpers/error_utils'
// import {
//     EmailNotConfirmedResponse,
//     ErrorCode,
//     ErrorResponse,
//     ErrorVisitor,
//     GenericErrorResponse,
//     UnauthorizedResponse,
//     UnexpectedErrorResponse,
// } from '../helpers/errors'
// import { makeRequest } from '../helpers/request'

// /////////////////
// ///////////////// Request
// /////////////////
// export type UpdatePasswordRequest = {
//     current_password?: string
//     password: string
// }

// /////////////////
// ///////////////// Errors specific to this request
// /////////////////
// export interface UpdatePasswordBadRequestResponse<V extends ErrorVisitor> extends ErrorResponse<V> {
//     error_code: ErrorCode.InvalidRequestFields
//     user_facing_errors: {
//         password?: string
//     }
//     field_errors: {
//         password?: string
//     }
// }

// export interface UpdatePasswordIncorrectPasswordResponse<V extends ErrorVisitor> extends GenericErrorResponse<V> {
//     error_code: ErrorCode.IncorrectPassword
//     user_facing_error: string
// }

// /////////////////
// ///////////////// Success and Error Responses
// /////////////////
// export type UpdatePasswordErrorResponse =
//     | UpdatePasswordBadRequestResponse<UpdatePasswordErrorVisitor>
//     | UpdatePasswordIncorrectPasswordResponse<UpdatePasswordErrorVisitor>
//     | UnauthorizedResponse<UpdatePasswordErrorVisitor>
//     | UnexpectedErrorResponse<UpdatePasswordErrorVisitor>
//     | EmailNotConfirmedResponse<UpdatePasswordErrorVisitor>

// export type UpdatePasswordSuccessResponse = {
//     ok: true
// }

// /////////////////
// ///////////////// Error Visitor
// /////////////////
// export interface UpdatePasswordErrorVisitor extends ErrorVisitor {
//     badRequest: (error: UpdatePasswordBadRequestResponse<UpdatePasswordErrorVisitor>) => void
//     incorrectPassword: (error: UpdatePasswordIncorrectPasswordResponse<UpdatePasswordErrorVisitor>) => void

//     // These are generic error responses that can occur on any request
//     unauthorized?: (error: UnauthorizedResponse<UpdatePasswordErrorVisitor>) => void
//     emailNotConfirmed?: (error: EmailNotConfirmedResponse<UpdatePasswordErrorVisitor>) => void
//     unexpectedOrUnhandled?: () => void
// }

// /////////////////
// ///////////////// The actual Request
// /////////////////
// export const updatePassword = (authUrl: string) => async (request: UpdatePasswordRequest) => {
//     return makeRequest<UpdatePasswordSuccessResponse, UpdatePasswordErrorResponse, UpdatePasswordErrorVisitor>({
//         authUrl,
//         path: '/update_password',
//         method: 'POST',
//         body: request,
//         errorToHandler: (error, visitor) => {
//             switch (error.error_code) {
//                 case ErrorCode.InvalidRequestFields:
//                     return getVisitorOrUndefined(visitor.badRequest, error)
//                 case ErrorCode.IncorrectPassword:
//                     return getVisitorOrUndefined(visitor.incorrectPassword, error)
//                 case ErrorCode.Unauthorized:
//                     return getVisitorOrUndefined(visitor.unauthorized, error)
//                 case ErrorCode.UnexpectedError:
//                     return visitor.unexpectedOrUnhandled
//             }
//         },
//     })
// }
