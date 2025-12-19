/**
 * Controller functions for example routes.
 */

import type { Request, Response } from "express"
import { GREETING } from "@/lib/constants"
import { sendSuccess } from "@/utils"

export function getRoot(_req: Request, res: Response): void {
	res.send(GREETING)
}

export function getExample(_req: Request, res: Response): void {
	sendSuccess(res, {
		message: "This is an example endpoint",
		version: "v1"
	})
}

export async function getAsyncExample(
	_req: Request,
	res: Response
): Promise<void> {
	// Simulate an async operation (e.g., database query, API call)
	const data = await Promise.resolve({
		message: "This is an async endpoint example",
		version: "v1",
		description: "Wrapped with asyncHandler to catch promise rejections"
	})

	sendSuccess(res, data)
}

export async function getAsyncErrorExample(
	_req: Request,
	_res: Response
): Promise<void> {
	// Simulate an async operation that throws an error
	await Promise.resolve()

	// This error will be caught by asyncHandler and passed to error middleware
	throw new Error("Example async error - caught by asyncHandler")
}
