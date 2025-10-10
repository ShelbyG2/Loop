import express from "express";
import {
  SignIn,
  Signup,
  EmailVerification,
  handleOAuth,
  getMe,
  Logout,
} from "../controller/authConroller.js";
import { errorHandler } from "../middleware/errorHandler.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", errorHandler, Signup);
router.post("/login", errorHandler, SignIn);
router.post("/verify-email", errorHandler, EmailVerification);
router.post("/oauth", errorHandler, handleOAuth);
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, errorHandler, Logout);

export default router;
