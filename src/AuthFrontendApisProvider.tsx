import React, { ReactNode, createContext } from 'react'

interface AuthFrontendApisState {
    authUrl: string
}

export const AuthFrontendApisContext = createContext<AuthFrontendApisState | undefined>(undefined)

interface AuthFrontendApisProps {
    authUrl: string
    children?: ReactNode
}

export const AuthFrontendApisProvider = ({ authUrl, children }: AuthFrontendApisProps) => {
    const authUrlState = {
        authUrl,
    }

    return <AuthFrontendApisContext.Provider value={authUrlState}>{children}</AuthFrontendApisContext.Provider>
}
