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
}

export type PropelAuthApi = ReturnType<typeof createFrontendApisClient>

export const createFrontendApisClient = ({ authUrl, baseApiUrl }: ApiOptions) => {
    const loginWithSocialProvider = (provider: SocialLoginProvider) => {
        window.location.href = `${authUrl}/${SOCIAL_LOGIN_PATHS[provider]}`
    }

    return {
        enableMfa: enableMfa(baseApiUrl),
        disableMfa: disableMfa(baseApiUrl),
        fetchMfaStatusWithNewSecret: fetchMfaStatusWithNewSecret(baseApiUrl),
        updatePassword: updatePassword(baseApiUrl),
        deleteAccount: deleteAccount(baseApiUrl),
        updateUserMetadata: updateUserMetadata(baseApiUrl),
        updateEmail: updateEmail(baseApiUrl),
        fetchOrgMembers: fetchOrgMembers(baseApiUrl),
        fetchPendingOrgInvites: fetchPendingOrgInvites(baseApiUrl),
        fetchExpiredOrgInvites: fetchExpiredOrgInvites(baseApiUrl),
        inviteUserToOrg: inviteUserToOrg(baseApiUrl),
        removeUserFromOrg: removeUserFromOrg(baseApiUrl),
        updateUserRoleInOrg: updateUserRoleInOrg(baseApiUrl),
        revokeUserOrgInvitation: revokeUserOrgInvitation(baseApiUrl),
        updateOrgSettings: updateOrgSettings(baseApiUrl),
        fetchOrgSettings: fetchOrgSettings(baseApiUrl),
        deleteOrg: deleteOrg(baseApiUrl),
        createOrg: createOrg(baseApiUrl),
        fetchPersonalApiKeys: fetchPersonalApiKeys(baseApiUrl),
        createPersonalApiKey: createPersonalApiKey(baseApiUrl),
        fetchOrgApiKeys: fetchOrgApiKeys(baseApiUrl),
        createOrgApiKey: createOrgApiKey(baseApiUrl),
        deleteApiKey: deleteApiKey(baseApiUrl),
        fetchLoginState: fetchLoginState(baseApiUrl),
        emailPasswordLogin: emailPasswordLogin(baseApiUrl),
        resendEmailConfirmation: resendEmailConfirmation(baseApiUrl),
        verifyMfaForLogin: verifyMfaForLogin(baseApiUrl),
        verifyMfaBackupCodeForLogin: verifyMfaBackupCodeForLogin(baseApiUrl),
        sendForgotPasswordEmail: sendForgotPasswordEmail(baseApiUrl),
        fetchJoinableOrgs: fetchJoinableOrgs(baseApiUrl),
        joinOrg: joinOrg(baseApiUrl),
        passwordlessLogin: passwordlessLogin(baseApiUrl),
        loginViaSamlForOrg: loginViaSamlForOrg(baseApiUrl),
        signup: signup(baseApiUrl),
        loginWithSocialProvider,
    }
}
