export enum LoginState {
    LOGIN_REQUIRED = 'LoginRequired',
    TWO_FACTOR_REQUIRED = 'TwoFactorRequired',
    CONFIRM_EMAIL_REQUIRED = 'ConfirmEmailRequired',
    USER_METADATA_REQUIRED = 'UserMetadataRequired',
    ORG_CREATION_REQUIRED = 'OrgCreationRequired',
    UPDATE_PASSWORD_REQUIRED = 'UpdatePasswordRequired',
    TWO_FACTOR_ENABLEMENT_REQUIRED = 'TwoFactorEnablementRequired',
    FINISHED = 'Finished',
}
