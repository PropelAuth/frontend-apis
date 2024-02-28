import { useContext } from 'react'
import { disableMfa } from './apis/disableMfa'
import { enableMfa } from './apis/enableMfa'
import { fetchMfaStatusWithNewSecret } from './apis/mfaStatus'
import { AuthUrlContext } from './AuthUrlProvider'

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
        // deleteMe: deleteMe(authUrl),
        // updateEmail: updateEmail(authUrl),
        // updateUser: updateUser(authUrl),
    }
}

const validateAuthUrl = (authUrl: string) => {
    try {
        return new URL(authUrl).origin
    } catch {
        throw new Error('Invalid authUrl')
    }
}
