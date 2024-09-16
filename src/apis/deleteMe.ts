import { getVisitorOrUndefined } from '../helpers/error_utils'
import {
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
export interface DeletionIsDisabledError<V extends ErrorVisitor> extends GenericErrorResponse<V> {
    error_code: ErrorCode.ActionDisabled
    user_facing_error: string
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type DeleteMeErrorResponse =
    | DeletionIsDisabledError<DeleteMeErrorVisitor>
    | UnauthorizedResponse<DeleteMeErrorVisitor>
    | UnexpectedErrorResponse<DeleteMeErrorVisitor>

export type DeleteMeSuccessfulResponse = {
    ok: true
}

/////////////////
///////////////// Error Visitor
/////////////////
export interface DeleteMeErrorVisitor extends ErrorVisitor {
    unauthorized?: (error: UnauthorizedResponse<DeleteMeErrorVisitor>) => void
    deletionIsDisabled?: (error: DeletionIsDisabledError<DeleteMeErrorVisitor>) => void
    unexpectedOrUnhandled?: () => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const deleteMe = (authUrl: string) => async () => {
    return makeRequest<DeleteMeSuccessfulResponse, DeleteMeErrorResponse, DeleteMeErrorVisitor>({
        authUrl,
        path: '/delete_me',
        method: 'DELETE',
        errorToHandler: (error, visitor) => {
            switch (error.error_code) {
                case ErrorCode.ActionDisabled:
                    return getVisitorOrUndefined(visitor.deletionIsDisabled, error)
                case ErrorCode.Unauthorized:
                    return getVisitorOrUndefined(visitor.unauthorized, error)
                case ErrorCode.UnexpectedError:
                    return visitor.unexpectedOrUnhandled
            }
        },
    })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function test() {
    const response = await deleteMe('https://auth.example.com')()
    if (response.ok) {
        console.log('Success!')
        return
    }

    // One way to handle errors
    response.handleError({
        unauthorized: (error) => {
            console.log('Unauthorized')
            console.log(error.user_facing_error)
        },
        deletionIsDisabled: (error) => {
            console.log('Deletion is disabled')
            console.log(error.user_facing_error)
        },
        unexpectedOrUnhandled: () => {
            console.log('Unexpected or unhandled error')
        },
    })

    // Another way to handle errors, with the caveat that you might not know
    // which error codes are appropriate
    switch (response.error_code) {
        case ErrorCode.ActionDisabled:
            console.log('Deletion is disabled')
            console.log(response.user_facing_error)
            break
        case ErrorCode.Unauthorized:
            console.log('Unauthorized')
            console.log(response.user_facing_error)
            break
        default:
            console.log('Unexpected or unhandled error')
            break
    }
}
