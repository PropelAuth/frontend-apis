import { useContext } from 'react'
import { AuthUrlContext } from './AuthUrlProvider'
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
import { emailPasswordLogin } from './apis/login/emailPasswordLogin'
import { fetchLoginState } from './apis/login/fetchLoginState'
import { sendForgotPasswordEmail } from './apis/login/forgotPassword'
import { mfaLogin } from './apis/login/mfaLogin'
import { mfaLoginBackupCode } from './apis/login/mfaLoginBackupCode'
import { sendEmailConfirmation } from './apis/login/sendEmailConfirmation'
import { usernamePasswordLogin } from './apis/login/usernamePasswordLogin'
import { disableMfa } from './apis/mfa/disableMfa'
import { enableMfa } from './apis/mfa/enableMfa'
import { fetchMfaStatusWithNewSecret } from './apis/mfa/mfaStatus'
import { fetchExpiredOrgInvites } from './apis/orgMembership/fetchExpiredInvites'
import { fetchJoinableOrgs } from './apis/orgMembership/fetchJoinableOrgs'
import { fetchOrgMembers } from './apis/orgMembership/fetchOrgMembers'
import { fetchPendingOrgInvites } from './apis/orgMembership/fetchPendingInvites'
import { removeUserFromOrg } from './apis/removeUserFromOrg'
import { revokeUserOrgInvitation } from './apis/revokeUserOrgInvitation'
import { updateEmail } from './apis/updateEmail'
import { updateOrgSettings } from './apis/updateOrgSettings'
import { updatePassword } from './apis/updatePassword'
import { updateUserFacingMetadata } from './apis/updateUserMetadata'
import { updateUserRoleInOrg } from './apis/updateUserRoleInOrg'

export type ApiOptions = {
    authUrl: string
}

export type PropelAuthApi = ReturnType<typeof useAuthApis>

export const useAuthApis = () => {
    const context = useContext(AuthUrlContext)
    if (context === undefined) {
        throw new Error('useAuthApis must be used within an AuthUrlContext')
    }
    const authUrl = context.authUrl

    return {
        enableMfa: enableMfa(authUrl),
        disableMfa: disableMfa(authUrl),
        fetchMfaStatusWithNewSecret: fetchMfaStatusWithNewSecret(authUrl),
        updatePassword: updatePassword(authUrl),
        deleteAccount: deleteAccount(authUrl),
        updateUserMetadata: updateUserFacingMetadata(authUrl),
        updateEmail: updateEmail(authUrl),
        fetchOrgMembers: fetchOrgMembers(authUrl),
        fetchPendingOrgInvites: fetchPendingOrgInvites(authUrl),
        fetchExpiredOrgInvites: fetchExpiredOrgInvites(authUrl),
        inviteUserToOrg: inviteUserToOrg(authUrl),
        removeUserFromOrg: removeUserFromOrg(authUrl),
        updateUserRoleInOrg: updateUserRoleInOrg(authUrl),
        revokeUserOrgInvitation: revokeUserOrgInvitation(authUrl),
        updateOrgSettings: updateOrgSettings(authUrl),
        fetchOrgSettings: fetchOrgSettings(authUrl),
        deleteOrg: deleteOrg(authUrl),
        createOrg: createOrg(authUrl),
        fetchPersonalApiKeys: fetchPersonalApiKeys(authUrl),
        createPersonalApiKey: createPersonalApiKey(authUrl),
        fetchOrgApiKeys: fetchOrgApiKeys(authUrl),
        createOrgApiKey: createOrgApiKey(authUrl),
        deleteApiKey: deleteApiKey(authUrl),
        fetchLoginState: fetchLoginState(authUrl),
        emailPasswordLogin: emailPasswordLogin(authUrl),
        usernamePasswordLogin: usernamePasswordLogin(authUrl),
        sendEmailConfirmation: sendEmailConfirmation(authUrl),
        mfaLogin: mfaLogin(authUrl),
        mfaLoginBackupCode: mfaLoginBackupCode(authUrl),
        sendForgotPasswordEmail: sendForgotPasswordEmail(authUrl),
        fetchJoinableOrgs: fetchJoinableOrgs(authUrl),
    }
}
