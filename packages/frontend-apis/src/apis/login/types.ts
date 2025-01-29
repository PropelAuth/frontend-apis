export enum LoginState {
    LOGIN_REQUIRED = 'LoginRequired',
    TWO_FACTOR_REQUIRED = 'TwoFactorRequired',
    EMAIL_NOT_CONFIRMED_YET = 'ConfirmEmailRequired',
    USER_MISSING_REQUIRED_PROPERTIES = 'UserMetadataRequired',
    USER_MUST_BE_IN_AT_LEAST_ONE_ORG = 'OrgCreationRequired',
    UPDATE_PASSWORD_REQUIRED = 'UpdatePasswordRequired',
    TWO_FACTOR_ENROLLMENT_REQUIRED = 'TwoFactorEnablementRequired',
    LOGGED_IN = 'Finished',
}
