interface CookieOptions {
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

class CookieService {
  private getCookieValue(name: string): string | null {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  }

  get authToken(): string | null {
    return this.getCookieValue("auth_token");
  }

  get refreshToken(): string | null {
    return this.getCookieValue("refresh_token");
  }

  isAuthenticated(): boolean {
    const token = this.authToken;
    if (!token) return false;

    try {
      // Basic JWT expiration check
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }
}

export const cookieService = new CookieService();
