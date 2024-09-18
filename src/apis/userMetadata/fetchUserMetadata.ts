import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    EmailNotConfirmedResponse,
    ErrorCode,
    ApiErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../../helpers/errors'
import { Visitor, makeRequest } from '../../helpers/request'

/////////////////
///////////////// Errors specific to this request
/////////////////
export interface FetchMetadataUserNotFoundResponse extends ApiErrorResponse {
    error_code: ErrorCode.UserNotFound
}

export enum PropertyFieldType {
    Checkbox = 'Checkbox',
    Date = 'Date',
    Email = 'Email',
    Enum = 'Enum',
    Integer = 'Integer',
    Json = 'Json',
    LongText = 'LongText',
    Name = 'Name',
    PhoneNumber = 'PhoneNumber',
    PictureUrl = 'PictureUrl',
    Text = 'Text',
    Toggle = 'Toggle',
    Tos = 'Tos',
    Url = 'Url',
}

export enum PropertyFieldPermission {
    Write = 'Write',
    WriteIfUnset = 'WriteIfUnset',
    Read = 'Read',
}

export type UserPropertySetting = {
    name: string
    display_name: string
    field_type: PropertyFieldType
    show_in_account: boolean
    user_writable: PropertyFieldPermission
    required: boolean
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type FetchUserMetadataSuccessResponse = {
    username: string | null
    first_name: string | null
    last_name: string | null
    properties: { [key: string]: unknown }
    user_property_settings: UserPropertySetting[]
}

export type FetchUserMetadataErrorResponse =
    | FetchMetadataUserNotFoundResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse

/////////////////
///////////////// Error Visitor
/////////////////
type FetchUserMetadataVisitor = Visitor & {
    success: (response: FetchUserMetadataSuccessResponse) => FetchUserMetadataSuccessResponse | void
    userNotFound?: (error: FetchUserMetadataErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export const fetchUserMetadata = (authUrl: string) => async () => {
    return makeRequest<FetchUserMetadataVisitor, FetchUserMetadataErrorResponse, FetchUserMetadataSuccessResponse>({
        authUrl,
        path: '/user_properties',
        method: 'GET',
        parseResponseAsJson: true,
        responseToSuccessHandler: (response, visitor) => {
            return () => visitor.success(response)
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.UserNotFound:
                    return getVisitorOrUndefined(visitor.userNotFound, error)
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
