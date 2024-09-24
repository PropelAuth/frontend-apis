import { useContext } from 'react'
import { AuthUrlContext } from './AuthUrlProvider'
import { createOrg } from './apis/createOrg'
import { deleteAccount } from './apis/deleteAccount'
import { deleteOrg } from './apis/deleteOrg'
import { fetchOrgSettings } from './apis/fetchOrgSettings'
import { inviteUserToOrg } from './apis/inviteUserToOrg'
import { disableMfa } from './apis/mfa/disableMfa'
import { enableMfa } from './apis/mfa/enableMfa'
import { fetchMfaStatusWithNewSecret } from './apis/mfa/mfaStatus'
import { fetchExpiredOrgInvites } from './apis/orgMembership/fetchExpiredInvites'
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
        throw new Error('useAuthApis must be used within an AuthProvider')
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
    }
}
