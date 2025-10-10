import express from "express";

const router = express.Router();
import { getUsers } from "../controller/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

router.get("/", authMiddleware, authMiddleware, getUsers);
export default router;
