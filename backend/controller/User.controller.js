import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import createTransporter from "../config/email.js";
import { generateToken } from "../config/jwt.js";
dotenv.config();
export const check = async (req, res) => {
  return res.status(200).json({
    message: "success",
  });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required (name email password)",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      digits: true,
      specialChars: false,
    });

    const hashPassword = await bcrypt.hash(password, 10);
    const hashOtp = await bcrypt.hash(otp, 10);
    console.log("hash password :", hashPassword);
    //   send mail
    const transport = createTransporter();

    const info = await transport.sendMail({
      from: "Todo App || Krishna Mahto",
      to: email,
      subject: "Verify your email",
      html: `
          <h1>Verify your email</h1>
          <p>Use the following OTP to verify your email address: <strong>${otp}</strong></p>
        `,
    });
    const user = await User.create({
      name,
      email,
      password: hashPassword,
      isVerified: false,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${name}`,
      otp: hashOtp,
    });

    return res.status(200).json({
      message: "Signin successful",
      data: user,
    });
  } catch (error) {
    console.log("Error in signup :", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { otp, userId } = req.body;
    if (!otp || !userId) {
      return res.status(400).json({
        message: "OTP and User ID are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found !",
      });
    }
    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      return res.status(400).json({
        message: "Incorrect OTP",
      });
    }

    const token = generateToken(userId);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isVerified: true,
        otp: "",
      },
      { new: true }
    );
    return res.status(200).json({
      message: "Email verified successful",
      token: token,
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error !",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required (email , password)",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    user.password = undefined;
    if (!passwordMatch) {
      return res.status(404).json({
        message: "Password Incorrect",
      });
    }
    const token = generateToken(user._id);
    return res.status(200).json({
      message: "Logged in successful",
      data: user,
      token,
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const sendHii = async (req, res) => {
  try {
    console.log("SMTP_USER:", process.env.SMTP_USER);
    console.log("SMTP_PASS:", process.env.SMTP_PASS ? "Loaded" : "Not Loaded"); // Hide actual password

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP credentials are missing in environment variables.");
    }

    console.log("Into send email");

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Use an App Password if 2FA is enabled
      },
    });

    console.log("Transport created successfully");

    const info = await transport.sendMail({
      from: `"Todo App || Krishna Mahto" <${process.env.SMTP_USER}>`,
      to: "krishnamahato84044@gmail.com",
      subject: "Testing Email Send",
      html: `
        <h1>Hello</h1>
        <p>How are you?</p>
      `,
    });

    console.log("Mail sent info:", info.messageId);
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error in sendHii:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
