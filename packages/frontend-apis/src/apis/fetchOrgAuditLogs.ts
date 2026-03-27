import { getVisitorOrUndefined, unmatchedCase } from '../helpers/error_utils'
import {
    ApiErrorResponse,
    ApiErrorForSpecificFields,
    EmailNotConfirmedResponse,
    ErrorCode,
    ForbiddenErrorResponse,
    OrgNotFoundErrorResponse,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../helpers/errors'
import { Visitor, makeRequest } from '../helpers/request'
import { OrgAuditLogEventType, OrgAuditLogEvent } from '../orgAuditLogEvents'

/////////////////
///////////////// Request
/////////////////
export type FetchOrgAuditLogsRequest = {
    org_id: string
    page_number?: number
    page_size?: number
    event_type?: OrgAuditLogEventType
    start_date?: number
    end_date?: number
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type OrgAuditLog = OrgAuditLogEvent & {
    id: string
    created_at: number
    caused_by_user_id: string | null
    caused_by_user_email: string | null
    impersonated: boolean
    caused_by_employee: boolean
    caused_by_service: boolean
    relevant_user_email: string | null
}

export type FetchOrgAuditLogsSuccessResponse = {
    logs: OrgAuditLog[]
    total_logs: number
    current_page: number
    page_size: number
    has_more_results: boolean
}

export interface FetchOrgAuditLogsBadRequestResponse extends ApiErrorForSpecificFields {
    error_code: ErrorCode.InvalidRequestFields
    user_facing_errors: {
        page_size?: string
        page_number?: string
    }
    field_errors: {
        page_size?: string
        page_number?: string
    }
}

export interface OrgAuditLogsDisabledErrorResponse extends ApiErrorResponse {
    error_code: ErrorCode.ActionDisabled
}

export type FetchOrgAuditLogsErrorResponse =
    | FetchOrgAuditLogsBadRequestResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | ForbiddenErrorResponse
    | OrgNotFoundErrorResponse
    | OrgAuditLogsDisabledErrorResponse

/////////////////
///////////////// Visitor
/////////////////
export type FetchOrgAuditLogsVisitor = Visitor & {
    success: (data: FetchOrgAuditLogsSuccessResponse) => FetchOrgAuditLogsSuccessResponse | void
    badRequest?: (error: FetchOrgAuditLogsBadRequestResponse) => void
    orgAuditLogsDisabled?: (error: OrgAuditLogsDisabledErrorResponse) => void
    orgNotFound?: (error: OrgNotFoundErrorResponse) => void
    cannotAccessOrgAuditLogs?: (error: ForbiddenErrorResponse) => void
}

/////////////////
///////////////// The actual Request
/////////////////
export type FetchOrgAuditLogsFn = ReturnType<typeof fetchOrgAuditLogs>

export const fetchOrgAuditLogs = (authUrl: string) => async (request: FetchOrgAuditLogsRequest) => {
    const queryParams = new URLSearchParams()
    const { page_number, page_size, event_type, start_date, end_date } = request
    if (page_number) {
        queryParams.append('page_number', page_number.toString())
    }
    if (page_size) {
        queryParams.append('page_size', page_size.toString())
    }
    if (event_type) {
        queryParams.append('event_type', event_type)
    }
    if (start_date) {
        queryParams.append('start_date', start_date.toString())
    }
    if (end_date) {
        queryParams.append('end_date', end_date.toString())
    }

    return makeRequest<FetchOrgAuditLogsVisitor, FetchOrgAuditLogsErrorResponse, FetchOrgAuditLogsSuccessResponse>({
        authUrl,
        path: `/org/${request.org_id}/org_audit_log`,
        method: 'GET',
        parseResponseAsJson: true,
        queryParams,
        responseToSuccessHandler: (response, visitor) => {
            return () => visitor.success(response)
        },
        responseToErrorHandler: (error, visitor) => {
            const { error_code: errorCode } = error
            switch (errorCode) {
                case ErrorCode.Unauthorized:
                    return getVisitorOrUndefined(visitor.unauthorized, error)
                case ErrorCode.EmailNotConfirmed:
                    return getVisitorOrUndefined(visitor.emailNotConfirmed, error)
                case ErrorCode.UnexpectedError:
                    return getVisitorOrUndefined(visitor.unexpectedOrUnhandled, error)
                case ErrorCode.Forbidden:
                    return getVisitorOrUndefined(visitor.cannotAccessOrgAuditLogs, error)
                case ErrorCode.InvalidRequestFields:
                    return getVisitorOrUndefined(visitor.badRequest, error)
                case ErrorCode.OrgNotFound:
                    return getVisitorOrUndefined(visitor.orgNotFound, error)
                case ErrorCode.ActionDisabled:
                    return getVisitorOrUndefined(visitor.orgAuditLogsDisabled, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
