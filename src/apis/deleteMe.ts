// import { getVisitorOrUndefined } from '../helpers/error_utils'
// import { ErrorCode, GenericErrorResponse, UnauthorizedResponse, UnexpectedErrorResponse } from '../helpers/errors'
// import { SuccessfulResponse, Visitor, makeRequest } from '../helpers/request'

// /////////////////
// ///////////////// Errors specific to this request
// /////////////////
// export interface DeletionIsDisabledError<V extends Visitor> extends GenericErrorResponse<V> {
//     error_code: ErrorCode.ActionDisabled
//     user_facing_error: string
// }

// /////////////////
// ///////////////// Success and Error Responses
// /////////////////
// export type DeleteMeErrorResponse =
//     | DeletionIsDisabledError<DeleteMeVisitor>
//     | UnauthorizedResponse<DeleteMeVisitor>
//     | UnexpectedErrorResponse<DeleteMeVisitor>

// export type DeleteMeSuccessfulResponse = SuccessfulResponse<DeleteMeVisitor>

// /////////////////
// ///////////////// Visitor
// /////////////////
// export interface DeleteMeVisitor extends Visitor {
//     unauthorized?: (error: UnauthorizedResponse<DeleteMeVisitor>) => Promise<void> | void
//     deletionIsDisabled?: (error: DeletionIsDisabledError<DeleteMeVisitor>) => Promise<void> | void
// }

// /////////////////
// ///////////////// The actual request
// /////////////////
// export const deleteMe = (authUrl: string) => async () => {
//     return makeRequest<DeleteMeSuccessfulResponse, DeleteMeErrorResponse, DeleteMeVisitor>({
//         hasJsonResponse: false,
//         authUrl,
//         path: '/delete_me',
//         method: 'DELETE',
//         responseToHandler: (response, visitor) => {
//             if (response.ok) {
//                 return visitor.success
//             } else {
//                 switch (response.error_code) {
//                     case ErrorCode.ActionDisabled:
//                         return getVisitorOrUndefined(visitor.deletionIsDisabled, response)
//                     case ErrorCode.Unauthorized:
//                         return getVisitorOrUndefined(visitor.unauthorized, response)
//                     case ErrorCode.UnexpectedError:
//                         return visitor.unexpectedOrUnhandled
//                 }
//             }
//         },
//     })
// }

// async function test() {
//     const response = await deleteMe('https://auth.example.com')()

//     // One way to handle errors
//     await response.handle({
//         success: async () => {
//             await new Promise((resolve) => setTimeout(resolve, 1000))
//             console.log('Success!')
//         },
//         unauthorized: (error) => {
//             console.log('Unauthorized')
//             console.log(error.user_facing_error)
//         },
//         deletionIsDisabled: (error) => {
//             console.log('Deletion is disabled')
//             console.log(error.user_facing_error)
//         },
//         unexpectedOrUnhandled: () => {
//             console.log('Unexpected or unhandled error')
//         },
//     })

//     // Another way to handle errors, with the caveat that you might not know
//     // which error codes are appropriate
//     if (response.ok) {
//         console.log('Success!')
//         return
//     }

//     switch (response.error_code) {
//         case ErrorCode.ActionDisabled:
//             console.log('Deletion is disabled')
//             console.log(response.user_facing_error)
//             break
//         case ErrorCode.Unauthorized:
//             console.log('Unauthorized')
//             console.log(response.user_facing_error)
//             break
//         default:
//             console.log('Unexpected or unhandled error')
//             break
//     }
// }
