import { ApiErrorResponse, ErrorCode, ResourceNotFoundErrorResponse } from '../../helpers/errors'

export interface McpNotEnabledErrorResponse extends ApiErrorResponse {
    error_code: ErrorCode.ActionDisabled
}

// The consent request could not be found. It may have expired, or the token may be invalid.
export type GrantRequestNotFoundErrorResponse = ResourceNotFoundErrorResponse
