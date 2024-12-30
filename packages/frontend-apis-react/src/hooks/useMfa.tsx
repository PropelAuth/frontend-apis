import type { EnableMfaFn, DisableMfaFn } from '@propelauth/frontend-apis'
import { ApiErrorResponse, MfaDisabledResponse, MfaEnabledResponse, MfaStatusResponse } from '@propelauth/frontend-apis'
import { useEffect, useState } from 'react'
import { useAuthFrontendApis } from '../client'

export enum MfaStatus {
    Loading = 'loading',
    Disabled = 'disabled',
    Enabled = 'enabled',
    UnexpectedError = 'unexpected_error',
}

export type UseMfaReturnType = {
    reloadMfaStatus: () => Promise<void>
} & (
    | {
          status: MfaStatus.Loading
          data: never
          enableMfa: never
          disableMfa: never
      }
    | {
          status: MfaStatus.Disabled
          data: MfaDisabledResponse
          enableMfa: EnableMfaFn
          disableMfa: never
      }
    | {
          status: MfaStatus.Enabled
          data: MfaEnabledResponse
          enableMfa: never
          disableMfa: DisableMfaFn
      }
    | {
          status: MfaStatus.UnexpectedError
          data: never
          enableMfa: never
          disableMfa: never
      }
)

export const useMfa: () => UseMfaReturnType = () => {
    const { enableMfa, disableMfa, fetchMfaStatusWithNewSecret } = useAuthFrontendApis()

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<ApiErrorResponse | undefined>(undefined)
    const [response, setResponse] = useState<MfaStatusResponse | undefined>(undefined)

    const reloadMfaStatus = async () => {
        setError(undefined)
        setIsLoading(true)
        fetchMfaStatusWithNewSecret()
            .then(async (response) => {
                await response.handle({
                    success: (response) => {
                        setResponse(response)
                    },
                    unexpectedOrUnhandled(error) {
                        setError(error)
                    },
                })
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        reloadMfaStatus()
    }, [])

    if (isLoading) {
        return {
            status: MfaStatus.Loading,
            reloadMfaStatus,
            data: undefined as never,
            enableMfa: undefined as never,
            disableMfa: undefined as never,
        }
    } else if (error || !response) {
        return {
            status: MfaStatus.UnexpectedError,
            reloadMfaStatus,
            data: undefined as never,
            enableMfa: undefined as never,
            disableMfa: undefined as never,
        }
    } else if (!response.mfa_enabled) {
        return {
            status: MfaStatus.Disabled,
            reloadMfaStatus,
            data: response,
            enableMfa,
            disableMfa: undefined as never,
        }
    } else {
        return {
            status: MfaStatus.Enabled,
            reloadMfaStatus,
            data: response,
            enableMfa: undefined as never,
            disableMfa,
        }
    }
}
