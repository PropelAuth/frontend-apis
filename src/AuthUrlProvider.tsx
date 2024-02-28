import React, { ReactNode, createContext } from 'react'

interface AuthUrlState {
    authUrl: string
}

export const AuthUrlContext = createContext<AuthUrlState | undefined>(undefined)

interface AuthUrlProviderProps {
    authUrl: string
    children?: ReactNode
}

export const AuthUrlProvider = ({ authUrl, children }: AuthUrlProviderProps) => {
    const authUrlState = {
        authUrl,
    }

    return <AuthUrlContext.Provider value={authUrlState}>{children}</AuthUrlContext.Provider>
}
