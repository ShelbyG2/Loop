import express from "express";
import {
  createMsg,
  deleteMsg,
  getMsg,
  updateMsg,
} from "../controller/messageController.js";

const router = express.Router();
router.post("/createmsg", createMsg);
router.delete("/deletemsg/:messageId", deleteMsg);
router.get("/getmsg:messageId", getMsg);
router.put("/updatemsg/:messageId", updateMsg);
export default router;
