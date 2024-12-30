import { useMemo } from 'react'
import { useAuthUrl } from '@propelauth/react'
import { createFrontendApisClient } from '@propelauth/frontend-apis'

export const useAuthFrontendApis: () => ReturnType<typeof createFrontendApisClient> = () => {
    const authUrl = useAuthUrl()
    return useMemo(() => {
        return createFrontendApisClient({ authUrl, baseApiUrl: authUrl })
    }, [authUrl])
}
