/**
 * Stub implementation of UserService for development and testing.
 *
 * This provides a working auth flow out of the box with a test user.
 * Replace this with a real implementation (e.g., database-backed) in production.
 *
 * Test credentials:
 *   email: test@example.com
 *   password: password123
 */

import type { User, UserService } from "./user.service"

// In-memory user store with a test user
// Password "password123" - in a real app, this would be hashed
const users = new Map<string, User>([
	[
		"1",
		{
			id: "1",
			email: "test@example.com",
			// This is a plain comparison for the stub - real implementations should use bcrypt
			passwordHash: "password123"
		}
	]
])

export const stubUserService: UserService = {
	async findByEmail(email: string): Promise<User | null> {
		for (const user of users.values()) {
			if (user.email === email) {
				return user
			}
		}
		return null
	},

	async validatePassword(user: User, password: string): Promise<boolean> {
		// Stub uses plain text comparison - real implementations should use bcrypt.compare()
		return user.passwordHash === password
	},

	async findById(id: string): Promise<User | null> {
		return users.get(id) ?? null
	}
}
