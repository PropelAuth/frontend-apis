import { getVisitorOrUndefined, unmatchedCase } from '../../helpers/error_utils'
import {
    ApiErrorForSpecificFields,
    ApiErrorResponse,
    EmailNotConfirmedResponse,
    ErrorCode,
    UnauthorizedResponse,
    UnexpectedErrorResponse,
} from '../../helpers/errors'
import { LoggedInVisitor, makeRequest } from '../../helpers/request'

/////////////////
///////////////// Request
/////////////////
export type FetchSessionsRequest = {
    page_number?: number
    page_size?: number
}

/////////////////
///////////////// Success and Error Responses
/////////////////
export type UserAgentData = {
	display_name: string;
	device_type: "Desktop" | "Mobile" | "Tablet" | "Unknown";
	browser: string | null;
	browser_version: string | null;
	os: string | null;
	os_version: string | null;
};

export type SessionData = {
	session_id: string;
	ip_address: string | null;
	user_agent: UserAgentData;
	country_code: string | null;
	created_at: number;
	last_active_at: number;
	current_session: boolean;
};

export type FetchSessionsDataSuccessResponse = {
	sessions: SessionData[];
	total_count: number;
	page_size: number;
	current_page: number;
	has_more_results: boolean;
};

export interface FetchSessionsBadRequestResponse extends ApiErrorForSpecificFields {
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

export interface SessionManagementDisabledErrorResponse extends ApiErrorResponse {
    error_code: ErrorCode.ActionDisabled
}

export type FetchSessionsErrorResponse =
    | FetchSessionsBadRequestResponse
    | UnauthorizedResponse
    | UnexpectedErrorResponse
    | EmailNotConfirmedResponse
    | SessionManagementDisabledErrorResponse

/////////////////
///////////////// Visitor
/////////////////
export type FetchSessionsVisitor = LoggedInVisitor & {
    success: (data: FetchSessionsDataSuccessResponse) => FetchSessionsDataSuccessResponse | void
    badRequest?: (error: FetchSessionsBadRequestResponse) => void
    sessionManagementDisabled?: (error: SessionManagementDisabledErrorResponse) => void
}

/////////////////
///////////////// Request
/////////////////
export type FetchSessionsFn = ReturnType<typeof fetchSessions>

export const fetchSessions = (authUrl: string) => async (request: FetchSessionsRequest) => {
    const queryParams = new URLSearchParams()
    const { page_number, page_size } = request
    if (page_number) {
        queryParams.append('page_number', page_number.toString())
    }
    if (page_size) {
        queryParams.append('page_size', page_size.toString())
    }

    return makeRequest<
        FetchSessionsVisitor,
        FetchSessionsErrorResponse,
        FetchSessionsDataSuccessResponse
    >({
        authUrl,
        path: '/sessions',
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
                case ErrorCode.ActionDisabled:
                    return getVisitorOrUndefined(visitor.sessionManagementDisabled, error)
                case ErrorCode.InvalidRequestFields:
                    return getVisitorOrUndefined(visitor.badRequest, error)
                default:
                    unmatchedCase(errorCode)
                    return undefined
            }
        },
    })
}
