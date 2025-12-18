import { stubUserService } from "@/services/user.service.stub"

describe("stubUserService", () => {
	describe("findByEmail", () => {
		it("should return user when email exists", async () => {
			const user = await stubUserService.findByEmail("test@example.com")

			expect(user).not.toBeNull()
			expect(user?.id).toBe("1")
			expect(user?.email).toBe("test@example.com")
			expect(user?.passwordHash).toBe("password123")
		})

		it("should return null when email does not exist", async () => {
			const user = await stubUserService.findByEmail("nonexistent@example.com")

			expect(user).toBeNull()
		})

		it("should be case-sensitive for email lookup", async () => {
			const user = await stubUserService.findByEmail("TEST@EXAMPLE.COM")

			expect(user).toBeNull()
		})

		it("should return null for empty email", async () => {
			const user = await stubUserService.findByEmail("")

			expect(user).toBeNull()
		})
	})

	describe("validatePassword", () => {
		it("should return true for correct password", async () => {
			const user = await stubUserService.findByEmail("test@example.com")
			expect(user).not.toBeNull()

			const isValid = await stubUserService.validatePassword(
				user!,
				"password123"
			)

			expect(isValid).toBe(true)
		})

		it("should return false for incorrect password", async () => {
			const user = await stubUserService.findByEmail("test@example.com")
			expect(user).not.toBeNull()

			const isValid = await stubUserService.validatePassword(
				user!,
				"wrongpassword"
			)

			expect(isValid).toBe(false)
		})

		it("should return false for empty password", async () => {
			const user = await stubUserService.findByEmail("test@example.com")
			expect(user).not.toBeNull()

			const isValid = await stubUserService.validatePassword(user!, "")

			expect(isValid).toBe(false)
		})

		it("should be case-sensitive for password", async () => {
			const user = await stubUserService.findByEmail("test@example.com")
			expect(user).not.toBeNull()

			const isValid = await stubUserService.validatePassword(
				user!,
				"PASSWORD123"
			)

			expect(isValid).toBe(false)
		})
	})

	describe("findById", () => {
		it("should return user when id exists", async () => {
			const user = await stubUserService.findById("1")

			expect(user).not.toBeNull()
			expect(user?.id).toBe("1")
			expect(user?.email).toBe("test@example.com")
		})

		it("should return null when id does not exist", async () => {
			const user = await stubUserService.findById("999")

			expect(user).toBeNull()
		})

		it("should return null for empty id", async () => {
			const user = await stubUserService.findById("")

			expect(user).toBeNull()
		})

		it("should return null for undefined-like id", async () => {
			const user = await stubUserService.findById("undefined")

			expect(user).toBeNull()
		})
	})
})
