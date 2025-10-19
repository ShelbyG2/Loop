interface CookieOptions {
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

interface AuthStatus {
  isAuthenticated: boolean;
  error?: string;
}

class CookieService {
  getCookie(name: string): string | null {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  }

  setCookie(name: string, value: string, options: CookieOptions = {}) {
    const defaultOptions: CookieOptions = {
      path: "/",
      secure: true,
      sameSite: "strict",
    };

    const cookieOptions = { ...defaultOptions, ...options };
    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (cookieOptions.path) cookieString += `;path=${cookieOptions.path}`;
    if (cookieOptions.domain) cookieString += `;domain=${cookieOptions.domain}`;
    if (cookieOptions.secure) cookieString += ";secure";
    if (cookieOptions.sameSite)
      cookieString += `;samesite=${cookieOptions.sameSite}`;

    document.cookie = cookieString;
  }

  deleteCookie(name: string) {
    this.setCookie(name, "", { path: "/" });
  }

  get authToken(): string | null {
    return this.getCookie("auth_token");
  }

  get refreshToken(): string | null {
    return this.getCookie("refresh_token");
  }

  /**
   * Check if HTTP-only cookie exists and is valid
   */
  isAuthenticated(): AuthStatus {
    const cookieString = document.cookie;
    const hasAuthCookie = cookieString.includes("auth_token=");

    if (!hasAuthCookie) {
      return {
        isAuthenticated: false,
        error: "No authentication cookie found",
      };
    }

    return {
      isAuthenticated: true,
    };
  }
}

export const cookieService = new CookieService();
