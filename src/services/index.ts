/**
 * Service exports.
 *
 * The userService defaults to the stub implementation.
 * To use a real implementation, replace the import:
 *
 * import { postgresUserService as userService } from "./user.service.postgres"
 */

export type { User, UserService } from "./user.service"
export { stubUserService as userService } from "./user.service.stub"
