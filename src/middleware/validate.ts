import type { NextFunction, Request, Response } from "express"
import type { ZodError, ZodSchema } from "zod"
import { ValidationError } from "@/errors"

/**
 * Validation target options
 */
type ValidateTarget = "body" | "params" | "query"

/**
 * Format Zod validation errors into a more readable structure
 */
const formatZodErrors = (error: ZodError): Record<string, unknown> => {
	const formatted: Record<string, string[]> = {}

	for (const issue of error.issues) {
		const path = issue.path.join(".")
		const message = issue.message

		if (!formatted[path]) {
			formatted[path] = []
		}

		formatted[path].push(message)
	}

	return formatted
}

/**
 * Middleware factory for validating requests using Zod schemas
 *
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate (body, params, or query)
 * @returns Express middleware function
 *
 * @example
 * ```ts
 * const createUserSchema = z.object({
 *   name: z.string().min(1),
 *   email: z.string().email()
 * })
 *
 * router.post('/users', validate(createUserSchema, 'body'), createUser)
 * ```
 */
export const validate = (
	schema: ZodSchema,
	target: ValidateTarget = "body"
) => {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			// Validate the specified target (body, params, or query)
			const data = req[target]

			// Parse and validate with Zod
			const result = schema.safeParse(data)

			if (!result.success) {
				// Format validation errors
				const errors = formatZodErrors(result.error)

				throw new ValidationError(
					`Validation failed for request ${target}`,
					errors
				)
			}

			// Replace the target with the parsed (and potentially transformed) data
			// This ensures type coercion and defaults are applied
			const validatedData = result.data as Record<string, unknown>

			// For body, we can directly reassign
			// For query and params, we need to clear and reassign properties
			if (target === "body") {
				req.body = validatedData
			} else {
				// Clear existing properties
				Object.keys(req[target]).forEach((key) => {
					delete req[target][key]
				})
				// Assign validated properties
				Object.keys(validatedData).forEach((key) => {
					;(req[target] as Record<string, unknown>)[key] = validatedData[key]
				})
			}

			next()
		} catch (error) {
			// Pass validation errors to error handler
			next(error)
		}
	}
}
