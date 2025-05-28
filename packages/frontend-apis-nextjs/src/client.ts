import { useMemo } from 'react'
import { useAuthUrl } from '@propelauth/nextjs/client'
import { createFrontendApisClient } from '@propelauth/frontend-apis'

export const useAuthFrontendApis: () => ReturnType<typeof createFrontendApisClient> = () => {
    const authUrl = useAuthUrl()

    return useMemo(() => {
        return createFrontendApisClient({
            authUrl,
            baseApiUrl: '/api/auth/fe',
            excludeBasePath: true,
        })
    }, [authUrl])
}
