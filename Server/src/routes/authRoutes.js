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

const router = express.Router();

router.post("/register", errorHandler, Signup);
router.post("/login", errorHandler, SignIn);
router.post("/verify-email", errorHandler, EmailVerification);
router.post("/oauth", errorHandler, handleOAuth);
router.get("/me", getMe);
router.post("/logout", errorHandler, Logout);

export default router;
