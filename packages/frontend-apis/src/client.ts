import { createOrgApiKey } from './apis/apiKeys/createOrgApiKey'
import { createPersonalApiKey } from './apis/apiKeys/createPersonalApiKey'
import { deleteApiKey } from './apis/apiKeys/deleteApiKey'
import { fetchOrgApiKeys } from './apis/apiKeys/fetchOrgApiKeys'
import { fetchPersonalApiKeys } from './apis/apiKeys/fetchPersonalApiKeys'
import { createOrg } from './apis/createOrg'
import { deleteAccount } from './apis/deleteAccount'
import { deleteOrg } from './apis/deleteOrg'
import { fetchOrgSettings } from './apis/fetchOrgSettings'
import { inviteUserToOrg } from './apis/inviteUserToOrg'
import { joinOrg } from './apis/joinOrg'
import { emailPasswordLogin } from './apis/login/emailPasswordLogin'
import { fetchLoginState } from './apis/login/fetchLoginState'
import { sendForgotPasswordEmail } from './apis/login/forgotPassword'
import { verifyMfaForLogin } from './apis/login/mfaLogin'
import { verifyMfaBackupCodeForLogin } from './apis/login/mfaLoginBackupCode'
import { passwordlessLogin } from './apis/login/passwordlessLogin'
import { resendEmailConfirmation } from './apis/login/resendEmailConfirmation'
import { loginViaSamlForOrg } from './apis/login/loginViaSamlForOrg'
import { disableMfa } from './apis/mfa/disableMfa'
import { enableMfa } from './apis/mfa/enableMfa'
import { fetchMfaStatusWithNewSecret } from './apis/mfa/mfaStatus'
import { fetchExpiredOrgInvites } from './apis/orgMembership/fetchExpiredInvites'
import { fetchJoinableOrgs } from './apis/orgMembership/fetchJoinableOrgs'
import { fetchOrgMembers } from './apis/orgMembership/fetchOrgMembers'
import { fetchPendingOrgInvites } from './apis/orgMembership/fetchPendingInvites'
import { removeUserFromOrg } from './apis/removeUserFromOrg'
import { revokeUserOrgInvitation } from './apis/revokeUserOrgInvitation'
import { signup } from './apis/signup'
import { updateEmail } from './apis/updateEmail'
import { updateOrgSettings } from './apis/updateOrgSettings'
import { updatePassword } from './apis/updatePassword'
import { updateUserMetadata } from './apis/updateUserMetadata'
import { updateUserRoleInOrg } from './apis/updateUserRoleInOrg'
import { SOCIAL_LOGIN_PATHS, SocialLoginProvider } from './socialLogins'

const BASE_PATH = '/api/fe/v3'

export type ApiOptions = {
    authUrl: string
    baseApiUrl: string
    excludeBasePath?: boolean
}

export type PropelAuthApi = ReturnType<typeof createFrontendApisClient>

export const createFrontendApisClient = ({ authUrl, baseApiUrl, excludeBasePath }: ApiOptions) => {
    // this is the only reason that we need the auth url on the frontend
    const loginWithSocialProvider = (provider: SocialLoginProvider) => {
        window.location.href = `${authUrl}/${SOCIAL_LOGIN_PATHS[provider]}`
    }

    const formattedApiUrl = excludeBasePath ? baseApiUrl : baseApiUrl + BASE_PATH

    return {
        enableMfa: enableMfa(formattedApiUrl),
        disableMfa: disableMfa(formattedApiUrl),
        fetchMfaStatusWithNewSecret: fetchMfaStatusWithNewSecret(formattedApiUrl),
        updatePassword: updatePassword(formattedApiUrl),
        deleteAccount: deleteAccount(formattedApiUrl),
        updateUserMetadata: updateUserMetadata(formattedApiUrl),
        updateEmail: updateEmail(formattedApiUrl),
        fetchOrgMembers: fetchOrgMembers(formattedApiUrl),
        fetchPendingOrgInvites: fetchPendingOrgInvites(formattedApiUrl),
        fetchExpiredOrgInvites: fetchExpiredOrgInvites(formattedApiUrl),
        inviteUserToOrg: inviteUserToOrg(formattedApiUrl),
        removeUserFromOrg: removeUserFromOrg(formattedApiUrl),
        updateUserRoleInOrg: updateUserRoleInOrg(formattedApiUrl),
        revokeUserOrgInvitation: revokeUserOrgInvitation(formattedApiUrl),
        updateOrgSettings: updateOrgSettings(formattedApiUrl),
        fetchOrgSettings: fetchOrgSettings(formattedApiUrl),
        deleteOrg: deleteOrg(formattedApiUrl),
        createOrg: createOrg(formattedApiUrl),
        fetchPersonalApiKeys: fetchPersonalApiKeys(formattedApiUrl),
        createPersonalApiKey: createPersonalApiKey(formattedApiUrl),
        fetchOrgApiKeys: fetchOrgApiKeys(formattedApiUrl),
        createOrgApiKey: createOrgApiKey(formattedApiUrl),
        deleteApiKey: deleteApiKey(formattedApiUrl),
        fetchLoginState: fetchLoginState(formattedApiUrl),
        emailPasswordLogin: emailPasswordLogin(formattedApiUrl),
        resendEmailConfirmation: resendEmailConfirmation(formattedApiUrl),
        verifyMfaForLogin: verifyMfaForLogin(formattedApiUrl),
        verifyMfaBackupCodeForLogin: verifyMfaBackupCodeForLogin(formattedApiUrl),
        sendForgotPasswordEmail: sendForgotPasswordEmail(formattedApiUrl),
        fetchJoinableOrgs: fetchJoinableOrgs(formattedApiUrl),
        joinOrg: joinOrg(formattedApiUrl),
        passwordlessLogin: passwordlessLogin(formattedApiUrl),
        loginViaSamlForOrg: loginViaSamlForOrg(formattedApiUrl),
        signup: signup(formattedApiUrl),
        loginWithSocialProvider,
    }
}
