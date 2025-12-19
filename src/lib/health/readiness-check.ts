/**
 * Readiness check logic for health endpoints.
 */

export type ReadinessCheckFn = () => boolean

let checkReadiness: ReadinessCheckFn = (): boolean => {
	// TODO: Add actual dependency checks when needed
	// For now, if the server is running, it's ready
	return true
}

export function isReady(): boolean {
	return checkReadiness()
}

export function setReadinessCheck(check: ReadinessCheckFn): void {
	checkReadiness = check
}

export function resetReadinessCheck(): void {
	checkReadiness = () => true
}
