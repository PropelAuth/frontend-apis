export enum ErrorCode {
    InvalidRequestFields = 'invalid_request_fields',
    BadRequest = 'bad_request',
    NotFound = 'not_found',
    UserNotFound = 'user_not_found',
    OrgNotFound = 'org_not_found',
    UnexpectedError = 'unexpected_error',
    DbError = 'db_error',
    Unauthorized = 'not_logged_in',
    Forbidden = 'action_forbidden',
    ActionDisabled = 'action_disabled',
    EmailNotConfirmed = 'email_not_confirmed',
    EmailSendFailure = 'email_send_failure',
    UserAccountLocked = 'account_locked',
    ConfirmationEmailAlreadySentRecently = 'confirmation_email_sent',
    IncorrectPassword = 'incorrect_password',
    MaxFileSizeExceeded = 'max_file_size',
    ActionAlreadyComplete = 'action_already_complete',
    OrgMaxUsersLimitExceeded = 'org_max_users_limit_exceeded',
    UserMaxOrgsLimitExceeded = 'user_max_orgs_limit_exceeded',
    PersonalDomainError = 'personal_domain_error',
    UserAccountDisabled = 'account_disabled',
    EmailAlreadyConfirmed = 'email_already_confirmed',
    RateLimited = 'rate_limit_exceeded',
    InvalidMfaCookie = 'invalid_mfa_cookie',
    UserAccountMfaLocked = 'account_mfa_locked',
    IncorrectMfaCode = 'incorrect_mfa_code',
    DomainNotAllowed = 'domain_not_allowed',
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

export interface ApiErrorForSpecificFields extends ApiErrorResponse {
    user_facing_error: never
    user_facing_errors: { [field: string]: string }
    field_errors: { [field: string]: string }
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

export interface OrgNotFoundErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.OrgNotFound
}

export interface UserNotFoundErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.UserNotFound
}

export interface OrgsNotEnabledErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.ActionDisabled
}

export interface ForbiddenErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.Forbidden
}

export interface UserMaxOrgsLimitExceededErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.UserMaxOrgsLimitExceeded
}

export interface OrgMaxUsersLimitExceededErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.OrgMaxUsersLimitExceeded
}

export interface NotFoundErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.NotFound
}

export interface UserAccountLockedErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.UserAccountLocked
}

export interface UserAccountDisabledErrorResponse extends GenericErrorResponse {
    error_code: ErrorCode.UserAccountDisabled
}

export interface IncorrectPasswordResponse extends GenericErrorResponse {
    error_code: ErrorCode.IncorrectPassword
    user_facing_error: string
}

export interface InvalidExpirationOptionResponse extends GenericErrorResponse {
    error_code: ErrorCode.BadRequest
    user_facing_error: string
}

export interface MfaSessionTimeoutErrorResponse extends ApiErrorResponse {
    error_code: ErrorCode.InvalidMfaCookie
}

export interface MfaAccountLockedErrorResponse extends ApiErrorResponse {
    error_code: ErrorCode.UserAccountMfaLocked
}

export interface IncorrectMfaCodeErrorResponse extends ApiErrorResponse {
    error_code: ErrorCode.IncorrectMfaCode
}
