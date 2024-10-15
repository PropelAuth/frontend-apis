export enum SocialLoginProvider {
    GOOGLE = 'Google',
    GITHUB = 'Github',
    MICROSOFT = 'Microsoft',
    SLACK = 'Slack',
    SALESFORCE = 'Salesforce',
    LINKEDIN = 'Linkedin',
    OUTREACH = 'Outreach',
    QUICKBOOKS = 'Quickbooks',
    XERO = 'Xero',
    SALESLOFT = 'Salesloft',
    ATLASSIAN = 'Atlassian',
    APPLE = 'Apple',
}

export const SOCIAL_LOGIN_PATHS: Record<SocialLoginProvider, string> = {
    [SocialLoginProvider.GOOGLE]: '/google/login',
    [SocialLoginProvider.GITHUB]: '/github/login',
    [SocialLoginProvider.MICROSOFT]: '/microsoft/login',
    [SocialLoginProvider.SLACK]: '/slack/login',
    [SocialLoginProvider.SALESFORCE]: '/salesforce/login',
    [SocialLoginProvider.LINKEDIN]: '/linkedin/login',
    [SocialLoginProvider.OUTREACH]: '/outreach/login',
    [SocialLoginProvider.QUICKBOOKS]: '/quickbooks/login',
    [SocialLoginProvider.XERO]: '/xero/login',
    [SocialLoginProvider.SALESLOFT]: '/salesloft/login',
    [SocialLoginProvider.ATLASSIAN]: '/atlassian/login',
    [SocialLoginProvider.APPLE]: '/apple/login',
}
