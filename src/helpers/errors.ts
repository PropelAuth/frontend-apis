export enum ErrorCode {
    InvalidRequestFields = 'invalid_request_fields',
    BadRequest = 'bad_request',
    UserNotFound = 'user_not_found',
    OrgNotFound = 'org_not_found',
    UnexpectedError = 'unexpected_error',
    DbError = 'db_error',
    Unauthorized = 'not_logged_in',
    Forbidden = 'action_forbidden',
    ActionDisabled = 'action_disabled',
    EmailNotConfirmed = 'email_not_confirmed',
    ConfirmationEmailAlreadySentRecently = 'confirmation_email_sent',
    IncorrectPassword = 'incorrect_password',
    MaxFileSizeExceeded = 'max_file_size',
    ActionAlreadyComplete = 'action_already_complete',
    OrgMaxUsersLimitExceeded = 'org_max_users_limit_exceeded',
}

export interface ApiErrorResponse {
    // An error code that can be used to determine the type of error
    error_code: ErrorCode

    // A error message that can be displayed to the user
    user_facing_error: string

    // If the request included fields that were invalid, this will be a map of
    // field names to field specific error messages. These can be displayed to
    // the user directly.
    user_facing_errors?: { [field: string]: string }

    // If the request included fields that were invalid, this will be a map of
    // field names to field specific error codes. You can use this to display
    // your own custom error messages. Otherwise, you can just display the
    // user_facing_error
    field_errors?: { [field: string]: string }
}

export interface GenericErrorResponse extends ApiErrorResponse {
    user_facing_errors: undefined
    field_errors: undefined
}

export interface UnauthorizedResponse extends GenericErrorResponse {
    error_code: ErrorCode.Unauthorized
}

export interface UnexpectedErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.UnexpectedError
}

export interface EmailNotConfirmedResponse extends GenericErrorResponse {
    error_code: ErrorCode.EmailNotConfirmed
}
