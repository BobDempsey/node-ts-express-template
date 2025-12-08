import type { NextFunction, Request, RequestHandler, Response } from "express"

/**
 * Wraps an async route handler to catch promise rejections
 * and forward them to Express error handling middleware
 *
 * @param fn - Async request handler function
 * @returns Express RequestHandler with error handling
 *
 * @example
 * router.get('/users/:id', asyncHandler(async (req, res) => {
 *   const user = await getUserById(req.params.id);
 *   res.json(user);
 * }));
 */
export const asyncHandler = (
	fn: (
		req: Request,
		res: Response,
		next: NextFunction
	) => Promise<void | Response>
): RequestHandler => {
	return (req: Request, res: Response, next: NextFunction): void => {
		Promise.resolve(fn(req, res, next)).catch(next)
	}
}
