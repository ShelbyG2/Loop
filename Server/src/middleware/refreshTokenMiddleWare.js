import supabase from "../config/supabaseConfig.js";
import { clearCookies, setTokenCookie } from "../utils/cookieUtils.js";

export const refreshTokenMiddleware = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    const currentToken = req.cookies.auth_token;

    const handleRefreshToken = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });
      if (error) {
        clearCookies(res);
        return false;
      }
      setTokenCookie(res, session.access_token, session.expires_in);
      return true;
    };
    if (refreshToken && !currentToken) {
      const success = await handleRefreshToken();

      if (!success) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }
      console.log("Token refreshed successfully");
      return next();
    }

    if (!refreshToken || !currentToken) {
      return next();
    }

    try {
      const { exp } = JSON.parse(atob(currentToken.split(".")[1]));
      const timeUntilExpiry = exp - Date.now() / 1000;

      if (timeUntilExpiry > 300) {
        return next();
      }

      const success = await handleRefreshToken();
      if (!success) {
        return res.status(401).json({ message: "Token refresh failed" });
      }
      return next();
    } catch (error) {
      clearCookies(res);
      return res.status(401).json({ message: "Invalid token format" });
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    next();
  }
};
