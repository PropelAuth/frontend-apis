import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import { ErrorCode, UnexpectedErrorResponse } from '../../helpers/errors'
import { Visitor, makeRequest } from '../../helpers/request'
import { LoginState } from './types'

/////////////////
///////////////// Success and Error Responses
/////////////////
export type FetchLoginStateSuccessResponse = {
    login_state: LoginState
}

export type FetchLoginStateErrorResponse = UnexpectedErrorResponse

/////////////////
///////////////// Visitor
/////////////////
export type FetchLoginStateVisitor = Visitor & {
    success: (data: FetchLoginStateSuccessResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type FetchLoginStateFn = ReturnType<typeof fetchLoginState>

export const fetchLoginState = (authUrl: string) => async () => {
    return makeRequest<FetchLoginStateVisitor, FetchLoginStateErrorResponse, FetchLoginStateSuccessResponse>({
        authUrl,
        path: '/login_state',
        method: 'GET',
        parseResponseAsJson: true,
        responseToSuccessHandler: (response, visitor) => {
            return () => visitor.success(response)
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.UnexpectedError:
                    return getVisitorOrUndefined(visitor.unexpectedOrUnhandled, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
