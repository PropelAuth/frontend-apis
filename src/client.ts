import { useContext } from 'react'
import { AuthUrlContext } from './AuthUrlProvider'
import { deleteAccount } from './apis/deleteAccount'
import { inviteUserToOrg } from './apis/inviteUserToOrg'
import { disableMfa } from './apis/mfa/disableMfa'
import { enableMfa } from './apis/mfa/enableMfa'
import { fetchMfaStatusWithNewSecret } from './apis/mfa/mfaStatus'
import { fetchOrgMembers } from './apis/orgMembership/fetchOrgMembers'
import { removeUserFromOrg } from './apis/removeUserFromOrg'
import { revokeUserOrgInvitation } from './apis/revokeUserOrgInvitation'
import { updateEmail } from './apis/updateEmail'
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
        inviteUserToOrg: inviteUserToOrg(authUrl),
        removeUserFromOrg: removeUserFromOrg(authUrl),
        updateUserRoleInOrg: updateUserRoleInOrg(authUrl),
        revokeUserOrgInvitation: revokeUserOrgInvitation(authUrl),
    }
}
