/**
 * User service interface for authentication.
 *
 * This module defines the contract for user operations needed by JWT auth.
 * Projects should implement this interface with their actual database/storage.
 */

export interface User {
	id: string
	email: string
	passwordHash: string
}

export interface UserService {
	/**
	 * Find a user by their email address
	 */
	findByEmail(email: string): Promise<User | null>

	/**
	 * Validate a password against the user's stored hash
	 */
	validatePassword(user: User, password: string): Promise<boolean>

	/**
	 * Find a user by their ID
	 */
	findById(id: string): Promise<User | null>
}
