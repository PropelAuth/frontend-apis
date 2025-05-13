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

export type ApiOptions = {
    authUrl: string
    baseApiUrl: string
    excludeBasePath?: boolean
}

export type PropelAuthApi = ReturnType<typeof createFrontendApisClient>

export const createFrontendApisClient = ({ authUrl, baseApiUrl, excludeBasePath }: ApiOptions) => {
    const loginWithSocialProvider = (provider: SocialLoginProvider) => {
        window.location.href = `${authUrl}/${SOCIAL_LOGIN_PATHS[provider]}`
    }

    return {
        enableMfa: enableMfa(baseApiUrl, excludeBasePath),
        disableMfa: disableMfa(baseApiUrl, excludeBasePath),
        fetchMfaStatusWithNewSecret: fetchMfaStatusWithNewSecret(baseApiUrl, excludeBasePath),
        updatePassword: updatePassword(baseApiUrl, excludeBasePath),
        deleteAccount: deleteAccount(baseApiUrl, excludeBasePath),
        updateUserMetadata: updateUserMetadata(baseApiUrl, excludeBasePath),
        updateEmail: updateEmail(baseApiUrl, excludeBasePath),
        fetchOrgMembers: fetchOrgMembers(baseApiUrl, excludeBasePath),
        fetchPendingOrgInvites: fetchPendingOrgInvites(baseApiUrl, excludeBasePath),
        fetchExpiredOrgInvites: fetchExpiredOrgInvites(baseApiUrl, excludeBasePath),
        inviteUserToOrg: inviteUserToOrg(baseApiUrl, excludeBasePath),
        removeUserFromOrg: removeUserFromOrg(baseApiUrl, excludeBasePath),
        updateUserRoleInOrg: updateUserRoleInOrg(baseApiUrl, excludeBasePath),
        revokeUserOrgInvitation: revokeUserOrgInvitation(baseApiUrl, excludeBasePath),
        updateOrgSettings: updateOrgSettings(baseApiUrl, excludeBasePath),
        fetchOrgSettings: fetchOrgSettings(baseApiUrl, excludeBasePath),
        deleteOrg: deleteOrg(baseApiUrl, excludeBasePath),
        createOrg: createOrg(baseApiUrl, excludeBasePath),
        fetchPersonalApiKeys: fetchPersonalApiKeys(baseApiUrl, excludeBasePath),
        createPersonalApiKey: createPersonalApiKey(baseApiUrl, excludeBasePath),
        fetchOrgApiKeys: fetchOrgApiKeys(baseApiUrl, excludeBasePath),
        createOrgApiKey: createOrgApiKey(baseApiUrl, excludeBasePath),
        deleteApiKey: deleteApiKey(baseApiUrl, excludeBasePath),
        fetchLoginState: fetchLoginState(baseApiUrl, excludeBasePath),
        emailPasswordLogin: emailPasswordLogin(baseApiUrl, excludeBasePath),
        resendEmailConfirmation: resendEmailConfirmation(baseApiUrl, excludeBasePath),
        verifyMfaForLogin: verifyMfaForLogin(baseApiUrl, excludeBasePath),
        verifyMfaBackupCodeForLogin: verifyMfaBackupCodeForLogin(baseApiUrl, excludeBasePath),
        sendForgotPasswordEmail: sendForgotPasswordEmail(baseApiUrl, excludeBasePath),
        fetchJoinableOrgs: fetchJoinableOrgs(baseApiUrl, excludeBasePath),
        joinOrg: joinOrg(baseApiUrl, excludeBasePath),
        passwordlessLogin: passwordlessLogin(baseApiUrl, excludeBasePath),
        loginViaSamlForOrg: loginViaSamlForOrg(baseApiUrl, excludeBasePath),
        signup: signup(baseApiUrl, excludeBasePath),
        loginWithSocialProvider,
    }
}
