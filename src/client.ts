import { useContext } from 'react'
import { AuthUrlContext } from './AuthUrlProvider'
import { disableMfa } from './apis/mfa/disableMfa'
import { enableMfa } from './apis/mfa/enableMfa'
import { fetchMfaStatusWithNewSecret } from './apis/mfa/mfaStatus'
import { updatePassword } from './apis/updatePassword'

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
        // deleteMe: deleteMe(authUrl),
        // updateEmail: updateEmail(authUrl),
        // updateUser: updateUser(authUrl),
    }
}

// const validateAuthUrl = (authUrl: string) => {
//     try {
//         return new URL(authUrl).origin
//     } catch {
//         throw new Error('Invalid authUrl')
//     }
// }
