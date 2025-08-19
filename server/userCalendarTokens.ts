// Simple in-memory storage for user calendar tokens
// In production, you'd want to store these securely in the database

interface UserCalendarTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date?: number;
}

class UserCalendarTokenStorage {
  private tokens: Map<string, UserCalendarTokens> = new Map();

  setTokens(userId: string, tokens: UserCalendarTokens) {
    this.tokens.set(userId, tokens);
  }

  getTokens(userId: string): UserCalendarTokens | null {
    return this.tokens.get(userId) || null;
  }

  removeTokens(userId: string) {
    this.tokens.delete(userId);
  }

  hasTokens(userId: string): boolean {
    return this.tokens.has(userId);
  }
}

export const userCalendarTokens = new UserCalendarTokenStorage();
export type { UserCalendarTokens };