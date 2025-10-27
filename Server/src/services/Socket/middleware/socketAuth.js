import { verifyToken } from "../../../middleware/authMiddleware.js";
import { createError } from "../../../utils/errorUtils.js";

export class SocketAuthMiddleware {
  static async authenticate(socket, next) {
    try {
      const token = SocketAuthMiddleware.extractToken(socket);
      if (!token) {
        return next(
          createError(401, "Authentication error: No token provided")
        );
      }
      const user = await verifyToken(token);

      if (!user) {
        return next(createError(401, "Invalid or expired Token"));
      }
      socket.user = user;
      console.log("Socket Authenticated");
      next();
    } catch (error) {
      next(createError(401, "Authentication failed"));
    }
  }
  static extractToken(socket) {
    return socket.handshake.headers.cookie
      ?.split(";")
      .find((c) => c.trim().startsWith("auth_token"))
      ?.split("=")[1];
  }
}
