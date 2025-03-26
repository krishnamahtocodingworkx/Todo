import express from "express";
import {
  check,
  login,
  sendHii,
  signup,
  verifyOtp,
} from "../controller/User.controller.js";

const router = express.Router();

router.get("/email", sendHii);
router.get("/check", check);
router.post("/signup", signup);
router.post("/verify-email", verifyOtp);
router.post("/login", login);

export default router;
