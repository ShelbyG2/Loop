import api from "../configs/axiosConfig";

interface CookieOptions {
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface AuthResponse {
  status: string;
  message: string;
  user: {
    id: string;
    email: string;
    username: string;
    isVerified: boolean;
    profilePic?: string;
  };
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
  getAuthStatus(): { isAuthenticated: boolean; error?: string } {
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

  async handleAuthResponse(tokens: AuthTokens): Promise<void> {
    try {
      // Let backend set HTTP-only cookies
      await api.post("/auth/set-cookies", tokens);

      // Set a client-side flag for quick auth checks
      this.setCookie("has_session", "true", {
        secure: true,
        sameSite: "strict",
      });
    } catch (error) {
      console.error("Failed to set auth cookies:", error);
      throw new Error("Authentication failed");
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/signin", {
        email,
        password,
      });

      // Backend will set HTTP-only cookies automatically
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  }

  async handleOAuth(
    provider: string,
    tokens: AuthTokens
  ): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/oauth", {
        provider,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "OAuth authentication failed"
      );
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
      this.deleteCookie("has_session");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear client-side cookies
      this.deleteCookie("has_session");
    }
  }

  async verifyAuth(): Promise<boolean> {
    try {
      await api.get("/auth/me");
      return true;
    } catch {
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.getCookie("has_session") === "true";
  }
}

export const cookieService = new CookieService();
