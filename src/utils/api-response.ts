import type { Response } from "express"

/**
 * Standard API response metadata
 */
export interface ApiResponseMeta {
	timestamp: string
	requestId?: string
	pagination?: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

/**
 * Standard API error structure
 */
export interface ApiErrorBody {
	message: string
	code: string
	statusCode: number
	details?: Record<string, unknown>
}

/**
 * Standard API response envelope
 * All API responses follow this structure for consistency
 */
export interface ApiResponse<T = unknown> {
	success: boolean
	data?: T
	error?: ApiErrorBody
	meta: ApiResponseMeta
}

/**
 * Send a successful API response with standardized envelope
 */
export function sendSuccess<T>(
	res: Response,
	data: T,
	statusCode = 200,
	meta?: Partial<Omit<ApiResponseMeta, "timestamp">>
): void {
	const response: ApiResponse<T> = {
		success: true,
		data,
		meta: {
			timestamp: new Date().toISOString(),
			...meta
		}
	}
	res.status(statusCode).json(response)
}

/**
 * Send an error API response with standardized envelope
 */
export function sendError(
	res: Response,
	message: string,
	code: string,
	statusCode: number,
	details?: Record<string, unknown>
): void {
	const response: ApiResponse<null> = {
		success: false,
		error: {
			message,
			code,
			statusCode,
			...(details && { details })
		},
		meta: {
			timestamp: new Date().toISOString()
		}
	}
	res.status(statusCode).json(response)
}
