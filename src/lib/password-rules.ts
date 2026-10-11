/** Shared password policy: used by account change, user creation and admin reset. */
export const MIN_PASSWORD_LENGTH = 10;

/** Returns a human-readable problem, or null when the password is acceptable. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain letters and numbers";
  }
  return null;
}
