import { useContext } from 'react'
import { AuthUrlContext } from './AuthUrlProvider'

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

export const useSocialLoginCallbacks = () => {
    const context = useContext(AuthUrlContext)
    if (context === undefined) {
        throw new Error('useSocialLoginCallbacks must be used within an AuthUrlContext')
    }
    const { authUrl } = context

    const loginWithSocialProvider = (provider: SocialLoginProvider) => {
        window.location.href = `${authUrl}/${SOCIAL_LOGIN_PATHS[provider]}`
    }

    return {
        loginWithSocialProvider,
    }
}
